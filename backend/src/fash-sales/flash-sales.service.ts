import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Audit } from 'src/common/audit';
import { ENV, TYPES } from 'src/common/constants';
import { Result } from 'src/common/result';
import { parseAndValidateDates } from 'src/common/utils';
import { IRedisService } from 'src/infrastructure/cache/redis.service';
import { FlashSale } from 'src/infrastructure/data-access/models/flash-sales.entity';
import { Repository } from 'typeorm';
import { DeleteResult } from 'typeorm/browser';
import { CreateFlashSaleDto } from './dto/create-flash-sale.dto';
import { UpdateFlashSaleDto } from './dto/update-flash-sale.dto';
import {
  IFlashSalesResponseDTO,
  IFlashSalesService,
} from './interface/flash.sales';

/**
 * Manages the business logic for flash sale operations.
 * This service handles creation, retrieval, updates, and deletion,
 * including validation and auditing.
 */
@Injectable()
export class FlashSalesService implements IFlashSalesService {
  constructor(
    @InjectRepository(FlashSale)
    private readonly flashSaleRepository: Repository<FlashSale>,
    @Inject(TYPES.IRedisService) private readonly cacheService: IRedisService,
  ) {}

  /**
   * Creates a new flash sale after validating its date constraints.
   *
   * @param createFlashSaleDto - The data for the new flash sale.
   * @returns A Result object containing the created flash sale DTO on success.
   * @throws {BadRequestException} If date validation fails or a database error occurs.
   */
  async create(
    createFlashSaleDto: CreateFlashSaleDto,
  ): Promise<Result<IFlashSalesResponseDTO>> {
    const { startDate, endDate, productId } = createFlashSaleDto;
    parseAndValidateDates(startDate, endDate);

    const audit = Audit.create({
      auditCreatedBy: 'System',
      auditCreatedDateTime: new Date().toISOString(),
    });

    const flashSale = this.flashSaleRepository.create({
      productId,
      startDate,
      endDate,
      auditCreatedBy: audit.auditCreatedBy,
      auditCreatedDateTime: audit.auditCreatedDateTime,
    });
    const result = await this.flashSaleRepository.save(flashSale);

    return Result.ok({
      id: result.id,
      productId: result.productId,
      startDate: result.startDate,
      endDate: result.endDate,
      auditCreatedBy: result.auditCreatedBy,
      auditCreatedDateTime: result.auditCreatedDateTime,
    });
  }

  /**
   * Retrieves all flash sale records from the database.
   *
   * @returns A Result object containing an array of all flash sales.
   */
  async findAll(): Promise<Result<FlashSale[]>> {
    // We could implement pagination here but for the sake of this exercise. We return all
    const flashSales: FlashSale[] = await this.flashSaleRepository.find();
    return Result.ok(flashSales);
  }

  /**
   * Finds a single flash sale by its unique identifier.
   *
   * @param id - The UUID of the flash sale to find.
   * @returns The flash sale entity if found, otherwise null.
   */
  async findOne(id: string): Promise<FlashSale | null> {
    const flashSale: FlashSale | null = await this.flashSaleRepository.findOne({
      where: { id },
    });
    return flashSale;
  }

  async update(
    id: string,
    updateFlashSaleDto: UpdateFlashSaleDto,
  ): Promise<Result<FlashSale>> {
    let flashSale = await this.findOne(id);

    if (!flashSale) {
      throw new NotFoundException(`Flash sale with ID "${id}" not found.`);
    }
    flashSale = this.flashSaleRepository.merge(flashSale, updateFlashSaleDto);
    // Hardcoding system here because this is supposed to be done by an admin.
    flashSale.auditModifiedBy = ENV.SYSTEM;
    flashSale.auditModifiedDateTime = new Date().toString();

    const updatedFlashSale = await this.flashSaleRepository.save(flashSale);
    return Result.ok(updatedFlashSale);
  }

  async remove(id: string): Promise<DeleteResult> {
    const result = await this.flashSaleRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Flash sale with ID "${id}" not found.`);
    }
    return result;
  }

  async validateActiveFlashSale(productId: string): Promise<void> {
    const flashSale = await this.findById(productId);

    if (!flashSale) {
      throw new NotFoundException(
        `Flash sale for product with id "${productId}" not found.`,
      );
    }

    const { startDate, endDate } = flashSale;
    const currentTime = Date.now();
    const startTime = new Date(startDate).getTime();
    const endTime = new Date(endDate).getTime();

    if (currentTime < startTime) {
      throw new ForbiddenException(
        `Flash sale has not started yet. It begins at ${startDate}.`,
      );
    }

    if (currentTime > endTime) {
      throw new BadRequestException(
        `Flash sale has ended. It concluded at ${endDate}.`,
      );
    }
  }

  async findById(productId: string): Promise<FlashSale | null> {
    const cacheKey = this.getCacheKey(productId);
    const cachedFlashSale = (await this.cacheService.get(
      cacheKey,
    )) as FlashSale;
    if (cachedFlashSale) {
      return cachedFlashSale;
    }

    const flashSale = await this.flashSaleRepository.findOne({
      where: { productId: productId },
    });

    if (flashSale) {
      await this.cacheService.set(cacheKey, flashSale, 3600);
    }
    return flashSale;
  }

  private getCacheKey(productId: string): string {
    return `flash-sale:${productId}`;
  }
}
