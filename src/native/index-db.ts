import Database from "better-sqlite3";
import type { Capability } from "@/shared/capability";
import type { OperationLogEntry } from "@/shared/operations";

export function createIndexDb(filename: string) {
  const db = new Database(filename);

  db.exec(`
    create table if not exists capabilities (
      id text primary key,
      data text not null
    );

    create table if not exists operation_logs (
      id text primary key,
      data text not null
    );
  `);

  const upsertCapability = db.prepare(`
    insert into capabilities (id, data)
    values (@id, @data)
    on conflict(id) do update set data = excluded.data
  `);
  const listCapabilitiesStatement = db.prepare("select data from capabilities order by id");
  const insertLog = db.prepare(`
    insert into operation_logs (id, data)
    values (@id, @data)
  `);
  const listLogsStatement = db.prepare("select data from operation_logs order by id");

  return {
    upsertCapabilities(capabilities: Capability[]) {
      const transaction = db.transaction((items: Capability[]) => {
        for (const capability of items) {
          upsertCapability.run({ id: capability.id, data: JSON.stringify(capability) });
        }
      });

      transaction(capabilities);
    },
    listCapabilities(): Capability[] {
      return listCapabilitiesStatement
        .all()
        .map((row) => JSON.parse((row as { data: string }).data) as Capability);
    },
    addOperationLog(entry: OperationLogEntry) {
      insertLog.run({ id: entry.id, data: JSON.stringify(entry) });
    },
    listOperationLogs(): OperationLogEntry[] {
      return listLogsStatement
        .all()
        .map((row) => JSON.parse((row as { data: string }).data) as OperationLogEntry);
    },
    close() {
      db.close();
    },
  };
}

export type IndexDb = ReturnType<typeof createIndexDb>;
