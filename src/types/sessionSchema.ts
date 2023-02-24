import {
  ExtractDocumentTypeFromTypedRxJsonSchema,
  toTypedRxJsonSchema,
  RxJsonSchema,
} from "rxdb";

export const sessionSchemaLiteral = {
  title: "session schema",
  version: 0,
  type: "object",
  primaryKey: "uuid",
  properties: {
    // use UUIDv4 for consistency
    uuid: {
      type: "string",
      maxLength: 36,
    },
    timestamp: {
      type: "number",
      // these are the limits of the milliseconds since UNIX epoch
      // min/max/multipleOf are necessary to use as an index in RxDB
      minimum: -8640000000000000,
      maximum: 8640000000000000,
      multipleOf: 1,
    },
    history: {
      type: "array",
      uniqueItems: false,
      items: {
        type: "object",
        properties: {
          target: {
            type: "string",
          },
          visibleHistory: {
            type: "string",
          },
          history: {
            type: "array",
            uniqueItems: false,
            items: {
              type: "object",
              properties: {
                key: {
                  type: "string",
                },
                correct: {
                  type: "boolean",
                },
                timestamp: {
                  type: "number",
                },
              },
            },
          },
        },
      },
    },
  },
  required: ["uuid", "timestamp", "history"],
  indexes: ["timestamp"],
} as const;
const sessionTyped = toTypedRxJsonSchema(sessionSchemaLiteral);
// get the document types from the schema
type sessionType = ExtractDocumentTypeFromTypedRxJsonSchema<
  typeof sessionTyped
>;
// create the RxJsonSchema instance w/ the types
export const sessionSchema: RxJsonSchema<sessionType> = sessionSchemaLiteral;
