"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Archive, Mail, MailOpen, MoreVertical, Reply, ShieldAlert, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import type { BulkMessageAction } from "@/app/api/messages/bulk/types";
import type { MessageActionsProps } from "./types";
import { getMessageActionRedirect, runSingleMessageAction } from "./utils";

export function MessageActions({ messageId, direction, status, read }: MessageActionsProps) {
	const router = useRouter();
	const [pendingAction, setPendingAction] = useState<BulkMessageAction | null>(null);
	const [error, setError] = useState<string | null>(null);

	async function runAction(action: BulkMessageAction) {
		setPendingAction(action);
		setError(null);
		try {
			await runSingleMessageAction(messageId, action);
			const redirect = getMessageActionRedirect(action, direction);
			if (redirect) router.push(redirect);
			router.refresh();
		} catch {
			setError("Could not update message");
		} finally {
			setPendingAction(null);
		}
	}

	const disabled = pendingAction !== null;
	const markAction: BulkMessageAction = read ? "unread" : "read";

	return (
		<div className="flex items-center gap-3 text-neutral-600">
			{error && <span className="text-xs text-red-600">{error}</span>}
			<div className="flex items-center gap-2">
				<Tooltip label="Reply">
					<Button type="button" variant="ghost" size="sm" aria-label="Reply">
						<Reply className="h-5 w-5" />
					</Button>
				</Tooltip>
				<Tooltip label="Archive">
					<Button
						variant="ghost"
						size="sm"
						aria-label="Archive"
						disabled={disabled}
						onClick={() => runAction("archive")}
					>
						<Archive className="h-5 w-5" />
					</Button>
				</Tooltip>
				<Tooltip label="Report spam">
					<Button
						variant="ghost"
						size="sm"
						aria-label="Report spam"
						disabled={disabled || status === "spam" || direction !== "inbound"}
						onClick={() => runAction("spam")}
					>
						<ShieldAlert className="h-5 w-5" />
					</Button>
				</Tooltip>
				<Tooltip label="Delete">
					<Button
						variant="ghost"
						size="sm"
						aria-label="Move to trash"
						disabled={disabled || status === "trash"}
						onClick={() => runAction("trash")}
					>
						<Trash2 className="h-5 w-5" />
					</Button>
				</Tooltip>
				<Tooltip label={read ? "Mark as unread" : "Mark as read"}>
					<Button
						variant="ghost"
						size="sm"
						aria-label={read ? "Mark as unread" : "Mark as read"}
						disabled={disabled}
						onClick={() => runAction(markAction)}
					>
						{read ? <Mail className="h-5 w-5" /> : <MailOpen className="h-5 w-5" />}
					</Button>
				</Tooltip>
				<Tooltip label="Move message">
					<select
						className="h-8 rounded-lg border border-neutral-200 bg-white px-2 text-xs text-neutral-700"
						disabled={disabled}
						defaultValue=""
						aria-label="Move message"
						onChange={(event) => {
							if (!event.target.value) return;
							void runAction(event.target.value as BulkMessageAction);
							event.target.value = "";
						}}
					>
						<option value="">Move to...</option>
						<option value="spam">Spam</option>
						<option value="trash">Trash</option>
					</select>
				</Tooltip>
				<Tooltip label="More actions">
					<span aria-label="More actions" className="rounded-full p-1 text-neutral-400">
						<MoreVertical className="h-5 w-5" />
					</span>
				</Tooltip>
			</div>
		</div>
	);
}
