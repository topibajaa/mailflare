"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { useCompose } from "@/components/compose/compose-context";
import { useMailSearch } from "@/components/mail-search/mail-search-context";
import { useSelectedMailbox } from "@/components/mailbox-provider";
import { useMessages } from "@/hooks/use-messages";
import type { BulkMessageAction } from "@/app/api/messages/bulk/types";
import { BulkMessageToolbar } from "./bulk-message-toolbar";
import type { MessageListRowProps, MessageFolderConfig } from "./types";
import {
	getPageRange,
	getMessageBadge,
	getMessageParty,
	getMessagePartyClassName,
	getMessagePreview,
	runBulkMessageAction,
} from "./utils";

const pageSize = 25;

function MessageListRow({ message, config, selected, onSelectedChange }: MessageListRowProps) {
	const Icon = config.icon;
	const { openDraftComposer } = useCompose();
	const unread = message.direction === "inbound" && !message.read;
	const className =
		`grid min-h-12 w-full grid-cols-[24px_32px_minmax(160px,240px)_1fr_auto] items-center gap-3 px-6 text-left text-sm hover:relative hover:z-10 hover:bg-[#f2f6fc] hover:shadow-sm ${
			selected ? "bg-blue-50" : ""
		}`;
	const content = (
		<>
			<Icon className="h-4 w-4 text-neutral-300" />
			<span className={getMessagePartyClassName(message, config.folder)}>
				{getMessageParty(message, config.folder)}
			</span>
			<span className="truncate text-neutral-700">
				<span className={unread ? "font-bold text-neutral-900" : ""}>
					{message.subject ?? "(no subject)"}
				</span>
				<span className="text-neutral-500"> - {getMessagePreview(message, config.folder)}</span>
			</span>
			{config.showRowBadge !== false && (
				<Badge variant={config.badgeVariant ?? "secondary"}>
					{getMessageBadge(message, config.folder)}
				</Badge>
			)}
		</>
	);

	if (config.folder === "drafts") {
		return (
			<div className={className}>
				<input
					type="checkbox"
					checked={selected}
					onChange={(event) => onSelectedChange(message.id, event.target.checked)}
					className="h-4 w-4 rounded border-neutral-300"
					aria-label="Select message"
				/>
				<button type="button" className="contents text-left" onClick={() => openDraftComposer(message.id)}>
					{content}
				</button>
			</div>
		);
	}

	return (
		<div className={className}>
			<input
				type="checkbox"
				checked={selected}
				onChange={(event) => onSelectedChange(message.id, event.target.checked)}
				className="h-4 w-4 rounded border-neutral-300"
				aria-label="Select message"
			/>
			<Link href={`${config.hrefPrefix}/${message.id}`} className="contents">
				{content}
			</Link>
		</div>
	);
}

export function MessageFolderPage({ config }: { config: MessageFolderConfig }) {
	const { selectedMailbox, isLoading: mailboxesLoading } = useSelectedMailbox();
	const { query } = useMailSearch();
	const [offset, setOffset] = useState(0);
	const [selectedIds, setSelectedIds] = useState<string[]>([]);
	const [pendingBulkAction, setPendingBulkAction] = useState(false);
	const { messages, isLoading, total, limit } = useMessages(config.folder, selectedMailbox?.id, {
		query,
		limit: pageSize,
		offset,
	}, !mailboxesLoading);
	const headerIcons = config.headerIcons ?? [];
	const hasActiveFilters = !!query.trim();
	const pageRange = getPageRange(offset, messages.length, total);
	const selectedMessages = useMemo(
		() => messages.filter((message) => selectedIds.includes(message.id)),
		[messages, selectedIds],
	);
	const hasUnreadSelection = selectedMessages.some((message) => !message.read);
	const allVisibleSelected = messages.length > 0 && messages.every((message) => selectedIds.includes(message.id));

	useEffect(() => {
		setOffset(0);
		setSelectedIds([]);
	}, [query, selectedMailbox?.id, config.folder]);

	useEffect(() => {
		setSelectedIds([]);
	}, [offset]);

	function updateSelectedMessage(messageId: string, selected: boolean) {
		setSelectedIds((current) =>
			selected ? [...new Set([...current, messageId])] : current.filter((id) => id !== messageId),
		);
	}

	function toggleAllVisible(selected: boolean) {
		const visibleIds = messages.map((message) => message.id);
		setSelectedIds((current) => {
			if (!selected) return current.filter((id) => !visibleIds.includes(id));
			return [...new Set([...current, ...visibleIds])];
		});
	}

	async function runSelectedAction(action: BulkMessageAction) {
		if (selectedIds.length === 0) return;

		setPendingBulkAction(true);
		try {
			await runBulkMessageAction(selectedIds, action);
			setSelectedIds([]);
		} finally {
			setPendingBulkAction(false);
		}
	}

	return (
		<div className="flex h-full flex-col">
			<div className="flex h-14 items-center justify-between border-b border-neutral-200 px-6">
				<div className="flex items-center gap-3 w-full">
					<Tooltip label="Select all visible messages">
						<input
							type="checkbox"
							checked={allVisibleSelected}
							disabled={messages.length === 0}
							onChange={(event) => toggleAllVisible(event.target.checked)}
							className="h-4 w-4 rounded border-neutral-300"
							aria-label="Select all visible messages"
						/>
					</Tooltip>
					{selectedIds.length > 0 ? (
						<BulkMessageToolbar
							selectedCount={selectedIds.length}
							hasUnreadSelection={hasUnreadSelection}
							onAction={runSelectedAction}
							onClearSelection={() => setSelectedIds([])}
							pending={pendingBulkAction}
						/>
					) : (
						null
						// <>
						// 	<h1 className="text-xl font-medium text-neutral-800">{config.title}</h1>
						// 	<Badge variant="secondary">{total}</Badge>
						// </>
					)}
				</div>
				{selectedIds.length === 0 && (
					<div className="flex items-center gap-2 text-neutral-500">
						<span className="text-xs text-neutral-500 whitespace-nowrap">
							{pageRange.start}-{pageRange.end} of {pageRange.total}
						</span>
						<Tooltip label="Previous page">
							<Button
								variant="ghost"
								size="sm"
								disabled={offset === 0 || isLoading}
								onClick={() => setOffset(Math.max(offset - limit, 0))}
								aria-label="Previous page"
							>
								<ChevronLeft className="h-4 w-4" />
							</Button>
						</Tooltip>
						<Tooltip label="Next page">
							<Button
								variant="ghost"
								size="sm"
								disabled={offset + messages.length >= total || isLoading}
								onClick={() => setOffset(offset + limit)}
								aria-label="Next page"
							>
								<ChevronRight className="h-4 w-4" />
							</Button>
						</Tooltip>
						{headerIcons.map((Icon, index) => (
							<Icon key={index} className="h-4 w-4" />
						))}
					</div>
				)}
			</div>

			<div className="divide-y divide-neutral-100">
				{messages.map((message) => (
					<MessageListRow
						key={message.id}
						message={message}
						config={config}
						selected={selectedIds.includes(message.id)}
						onSelectedChange={updateSelectedMessage}
					/>
				))}
				{isLoading && <p className="px-6 py-4 text-sm text-neutral-500">Loading...</p>}
				{!isLoading && messages.length === 0 && (
					<p className="px-6 py-4 text-sm text-neutral-500">
						{hasActiveFilters ? "No messages match these filters" : config.emptyText}
					</p>
				)}
			</div>
		</div>
	);
}
