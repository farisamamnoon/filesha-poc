import { Observable } from "rxjs";
import { JwtUser, Response, UserData } from "src/common/common.types";

export type fileUploadRequest = {
  tableName: Tables;
};

export type Template = {
  template: Tables;
};

export type getTemplate = {
  table: Tables;
  projectId?: string;
  hrms?: boolean;
  hrmsStartDate?: string;
  hrmsEndDate?: string;
  startDate?: string; // for sap
  endDate?: string;
  userId: string;
};

export type getAllBulkUploadsRequestData = {
  page?: number;
  pageSize?: number;
  userId?: string;
  activity?: string;
  search?: string;
};

export type getAllBulkUploadsRequest = {
  data: getAllBulkUploadsRequestData;
  user: UserData;
};

export type BulkUploadMetadata = {
  id: string;
  activities: any[];
  template: any;
  error: any;
  createAt: string;
  createdByUser: any;
};

export type getAllBulkUploadsResponse = {
  uploads: BulkUploadMetadata[];
  count: number;
};

export interface UploadService {
  GetAllUploads(
    data: getAllBulkUploadsRequest,
  ): Observable<Response<getAllBulkUploadsResponse>>;
  templateDownload(data: getTemplate): Observable<Response<fileResponse>>;
  Validate(data: applyRequest): Observable<Response<ValidateResponse>>;
  applyChanges(
    data: applyUserRequest,
  ): Observable<Response<ApplyChangesResponse>>;
  applyAsync(data: ApplyJob): Observable<Response<JobCreated>>;
  DownloadData(data: getTemplate): Observable<Response<fileResponse>>;
  downloadDataStream(data: getTemplate): Observable<FileChunk>;
  downloadTemplateStream(data: getTemplate): Observable<FileChunk>;
  getJobs(user: JwtUser): Observable<Response<UploadJob[]>>;

  validateAsync(data: JobId): Promise<Observable<Response<JobCreated>>>;

  // new multipart methods
  createMultipartUpload(
    data: CreateMultipartUploadRequest,
  ): Observable<CreateMultipartUploadResponse>;
  presignPart(data: PresignPartRequest): Observable<PresignPartResponse>;
  listParts(data: ListPartsRequest): Observable<ListPartsResponse>;
  completeMultipartUpload(
    data: CompleteMultipartUploadRequest,
  ): Observable<CompleteMultipartUploadResponse>;
  abortMultipartUpload(
    data: AbortMultipartUploadRequest,
  ): Observable<AbortMultipartUploadResponse>;
}

export interface UploadJob {
  jobId: string;
  fileName: string;
  status: string;
  table: Tables;
  actions: string[];
  rows: { rowId: number; errorMessage: string; column: string }[];
}

export interface FileChunk {
  chunk: Buffer;
}

export type applyUserRequest = {
  applyData: applyRequest;
  user: UserData;
};

export type applyRequest = {
  table: Tables;
  actions: string[];
  file: fileResponse;
  error: Array<validateError>;
  timezone?: string;
};

type validateError = {
  rowId: number;
};

export type ApplyChangesResponse = {
  message: string;
};

export type ValidateResponse = {
  validRows: number;
  errorRows: number;
  errors: ValidateData[];
};

export type ValidateData = {
  rowId: number;
  column: string;
  errorMessage: string;
};

export type fileResponse = {
  buffer: Buffer;
  fileName: string;
  contentType: string;
};

export type textToTextRequest = {
  text: string;
  lang: string;
};

export type ValidateStreamRequest = {
  table: Tables;
  actions: string[];
  file: fileResponse;
  user: UserData;
};

export type JobCreated = {
  jobId: string;
};

export interface ApplyJob {
  jobId: string;
}

export interface UploadMetadata {
  fileName: string;
  contentType: string;
  table: Tables;
  actions: string[];
  user: UserData;
  totalBytes: LongValue;
}

export type LongValue =
  | number
  | string
  | { toNumber(): number; toString(): string };

export interface ValidateRequestChunk {
  metadata?: UploadMetadata;
  chunk?: Uint8Array | Buffer;
}

export enum Tables {
  Activity = "Activity",
  Category = "Category",
  Company = "Company",
  Country = "Country",
  Currency = "Currency",
  Department = "Department",
  Designation = "Designation",
  Division = "Division",
  OwnEmployee = "OwnEmployee",
  SupplyEmployee = "SupplyEmployee",
  EngineerPlannedQuantity = "EngineerPlannedQuantity",
  GraceTimeTolerance = "GraceTimeTolerance",
  IssueType = "IssueType",
  LabourBudgetDirect = "LabourBudgetDirect",
  LabourBudgetDirectRevision = "LabourBudgetDirectRevision",
  LabourBudgetIndirect = "LabourBudgetIndirect",
  LabourBudgetIndirectRevision = "LabourBudgetIndirectRevision",
  Location = "Location",
  Project = "Project",
  ReportingMatrix = "ReportingMatrix",
  ShiftAllocation = "ShiftAllocation",
  ShiftAndBreak = "ShiftAndBreak",
  Staff = "Staff",
  Subcontractor = "Subcontractor",
  SubcontractorAssignment = "SubcontractorAssignment",
  Supplier = "Supplier",
  SupplyLabourBill = "SupplyLabourBill",
  SupplyLabourBillChange = "SupplyLabourBillChange",
  Task = "Task",
  TimesheetAuditLog = "TimesheetAuditLog",
  CostCodeSettings = "CostCodeSettings",
  TeamLeaderPlannedQuantity = "TeamLeaderPlannedQuantity",
  TimesheetUpdate = "TimesheetUpdate",
  Unit = "Unit",
  WorkDoneUpdate = "WorkDoneUpdate",
  Worker = "Workmen",
  WorkmenCategory = "WorkmenCategory",
  WorkmenCategoryRate = "WorkmenCategoryRate",
  WorkmenTransfer = "WorkmenTransfer",
}

export interface JobId {
  jobId: string;
}

export interface UploadMetadata {
  fileName: string;
  contentType: string;
  table: Tables;
  actions: string[];
  user: UserData;
  totalBytes: LongValue;
}

export interface CreateMultipartUploadRequest {
  table: string;
  actions: string[];
  fileName: string;
  contentType: string;
  fileSize: LongValue;
  user: UserData;
}

export interface CreateMultipartUploadResponse {
  jobId: string;
  uploadId: string;
  key: string;
}

export interface PresignPartRequest {
  uploadId: string;
  key: string;
  partNumber: number;
}

export interface PresignPartResponse {
  url: string;
}

export interface ListPartsRequest {
  uploadId: string;
  key: string;
}

export interface PartItem {
  partNumber: number;
  eTag: string;
  size: LongValue;
}

export interface ListPartsResponse {
  parts: PartItem[];
}

export interface CompleteMultipartUploadRequest {
  jobId: string;
  uploadId: string;
  key: string;
  parts: PartItem[];
}

export interface CompleteMultipartUploadResponse {
  fileUrl: string;
}

export interface AbortMultipartUploadRequest {
  uploadId: string;
  key: string;
  jobId: string;
}

export interface AbortMultipartUploadResponse {
  success: boolean;
}
