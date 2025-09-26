import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateFlashSaleDto } from './dto/update-flash-sale.dto';
import { CreateFlashSaleDto } from './dto/create-flash-sale.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { FlashSale } from 'src/infrastructure/data-access/models/flash-sales.entity';
import { Repository } from 'typeorm';
import { Audit } from 'src/common/audit';
import { Result } from 'src/common/result';
import { logError } from 'src/common/utils';
import { DeleteResult } from 'typeorm/browser';
import { ENV } from 'src/common/constants';

export interface IFlashSalesResponseDTO {
  id: string;
  startDate: string;
  endDate: string;
  auditCreatedBy: string;
  auditCreatedDateTime: string;
}

export interface IFlashSalesService {
  create(
    createFlashSaleDto: CreateFlashSaleDto,
  ): Promise<Result<IFlashSalesResponseDTO>>;
  findAll(): Promise<Result<FlashSale[]>>;
  findOne(id: string): Promise<FlashSale | null>;
  update(
    id: string,
    updateFlashSaleDto: UpdateFlashSaleDto,
  ): Promise<Result<FlashSale>>;
  remove(id: string): Promise<DeleteResult>;
  parseAndValidateDate(startDate: string, endDate: string): boolean;
}

/**
 * Manages the business logic for flash sale operations.
 * This service handles creation, retrieval, updates, and deletion,
 * including validation and auditing.
 */
@Injectable()
export class FlashSalesService {
  constructor(
    @InjectRepository(FlashSale)
    private readonly flashSaleRepository: Repository<FlashSale>,
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
    try {
      const { startDate, endDate, productId } = createFlashSaleDto;
      const validation = this.parseAndValidateDates(startDate, endDate);
      if (!validation) {
        throw new BadRequestException(
          'Error while validating flashsales parameters',
        );
      }
      const audit = Audit.create({
        auditCreatedBy: 'System',
        auditCreatedDateTime: new Date().toString(),
      });

      const result = await this.flashSaleRepository.save({
        productId,
        startDate,
        endDate,
        auditCreatedBy: audit.auditCreatedBy,
        auditCreatedDateTime: audit.auditCreatedDateTime,
      });
      return Result.ok({
        id: result.id,
        startDate: result.startDate,
        endDate: result.endDate,
        auditCreatedBy: result.auditCreatedBy,
        auditCreatedDateTime: result.auditCreatedDateTime,
      });
    } catch (error) {
      logError(error, FlashSalesService.name);
      throw error;
    }
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

  /**
   * Updates an existing flash sale's properties.
   *
   * @param id - The ID of the flash sale to update.
   * @param updateFlashSaleDto - The new values to apply.
   * @returns A Result object containing the updated flash sale entity.
   * @throws {NotFoundException} If no flash sale with the given ID exists.
   * @throws {BadRequestException} If the update operation fails.
   */
  async update(
    id: string,
    updateFlashSaleDto: UpdateFlashSaleDto,
  ): Promise<Result<FlashSale>> {
    try {
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
    } catch (error) {
      logError(error, FlashSalesService.name);
      throw error;
    }
  }

  /**
   * Deletes a flash sale from the database.
   *
   * @param id - The ID of the flash sale to delete.
   * @returns A TypeORM DeleteResult object detailing the outcome.
   * @throws {NotFoundException} If the flash sale to be deleted is not found.
   */
  async remove(id: string): Promise<DeleteResult> {
    try {
      const result = await this.flashSaleRepository.delete(id);
      if (result.affected === 0) {
        throw new NotFoundException(`Flash sale with ID "${id}" not found.`);
      }
      return result;
    } catch (error) {
      logError(error, FlashSalesService.name);
      throw error;
    }
  }

  /**
   * Validates the business rules for flash sale start and end dates.
   *
   * @param startDate - The proposed start date as an ISO string.
   * @param endDate - The proposed end date as an ISO string.
   * @returns `true` if all date rules pass.
   * @throws {BadRequestException} If any date rule is violated.
   */
  parseAndValidateDates(startDate: string, endDate: string): boolean {
    try {
      let valid = false;
      const startTime = new Date(startDate).getTime();
      const endTime = new Date(endDate).getTime();

      const currentTime = Date.now();

      if (isNaN(startTime)) {
        throw new BadRequestException('Invalid Start date');
      }

      if (isNaN(endTime)) {
        throw new BadRequestException('Invalid End date');
      }

      if (startTime <= currentTime || endTime <= currentTime) {
        throw new BadRequestException(
          'Start and End date must be in the future',
        );
      }

      if (startTime >= endTime) {
        throw new BadRequestException(
          'End time must be greater than start time',
        );
      }
      valid = true;
      return valid;
    } catch (error) {
      logError(error, FlashSalesService.name);
      throw error;
    }
  }
}
