import {
  ExtractDocumentTypeFromTypedRxJsonSchema,
  toTypedRxJsonSchema,
  RxJsonSchema,
} from "rxdb";

export const sessionSchemaLiteral = {
  title: "session schema",
  version: 0,
  type: "object",
  primaryKey: "timestamp",
  properties: {
    timestamp: {
      type: "string",
      // will always be output of Date.now()
      maxLength: 16,
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
  required: ["timestamp", "history"],
} as const;
const sessionTyped = toTypedRxJsonSchema(sessionSchemaLiteral);
// get the document types from the schema
type sessionType = ExtractDocumentTypeFromTypedRxJsonSchema<
  typeof sessionTyped
>;
// create the RxJsonSchema instance w/ the types
export const sessionSchema: RxJsonSchema<sessionType> = sessionSchemaLiteral;
