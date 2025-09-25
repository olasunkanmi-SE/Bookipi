export interface IAudit {
  auditCreatedDateTime: string;
  auditCreatedBy: string;
  auditModifiedDateTime?: string;
  auditModifiedBy?: string;
  auditDeletedDateTime?: string;
  auditDeletedBy?: string;
}

export class Audit implements IAudit {
  protected readonly props: IAudit;
  constructor(props: IAudit) {
    this.props = props;
  }
  get auditCreatedDateTime(): string {
    return this.props.auditCreatedDateTime;
  }

  get auditCreatedBy(): string {
    return this.props.auditCreatedBy;
  }

  get auditModifiedBy(): string | undefined {
    return this.props.auditModifiedBy;
  }

  set auditModifiedBy(email: string | undefined) {
    this.props.auditModifiedBy = email;
  }

  get auditModifiedDateTime(): string | undefined {
    return this.props.auditModifiedDateTime;
  }

  set auditModifiedDateTime(date: string | undefined) {
    this.props.auditModifiedDateTime = date;
  }

  get auditDeletedBy(): string | undefined {
    return this.props.auditDeletedBy;
  }

  set auditDeletedBy(email: string | undefined) {
    this.props.auditDeletedBy = email;
  }

  get auditDeletedDateTime(): string | undefined {
    return this.props.auditDeletedDateTime;
  }

  set auditDeletedDateTime(date: string | undefined) {
    this.props.auditDeletedDateTime = date;
  }

  static create(props: IAudit) {
    return new Audit(props);
  }

  update(props: Partial<IAudit>): Audit {
    const newProps = {
      ...this.props,
      ...props,
    };
    return new Audit(newProps);
  }
}
