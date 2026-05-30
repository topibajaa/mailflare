export type BulkMessageAction = "archive" | "trash" | "spam" | "read" | "unread" | "inbox";

export type BulkMessagePayload = {
	messageIds?: string[];
	action?: BulkMessageAction;
};
