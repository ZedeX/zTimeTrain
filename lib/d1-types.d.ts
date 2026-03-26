interface D1Database {
  prepare(query: string): D1PreparedStatement;
  exec(query: string): Promise<D1Result>;
  batch(statements: D1PreparedStatement[]): Promise<D1Result[]>;
  dump(): Promise<ArrayBuffer>;
}

interface D1PreparedStatement {
  bind(...values: any[]): D1PreparedStatement;
  first<T = unknown>(column?: string): Promise<T | null>;
  run(): Promise<D1Result>;
  all<T = unknown>(): Promise<D1Result<T>>;
  raw<T = unknown>(): Promise<T[]>;
}

interface D1Result<T = unknown> {
  results?: T[];
  success: boolean;
  meta: {
    duration: number;
    changes?: number;
    last_row_id?: number;
    served_by?: string;
    changed_db?: boolean;
    size_after?: number;
    read_rows?: number;
    read_bytes?: number;
    write_rows?: number;
    write_bytes?: number;
  };
}

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DB?: D1Database;
    }
  }
}

export {};
