import { FlowOperationType, PopulatedFlow } from '@activepieces/shared';
import { useMutation } from '@tanstack/react-query';
import {
  Copy,
  Download,
  EllipsisVertical,
  Pencil,
  Share2,
  Trash2,
} from 'lucide-react';
import React from 'react';

import { flowsApi } from '../lib/flows-api';
import { flowsUtils } from '../lib/flows-utils';

import { ConfirmationDeleteDialog } from '@/components/delete-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { INTERNAL_ERROR_TOAST, toast } from '@/components/ui/use-toast';
import { authenticationSession } from '@/lib/authentication-session';

interface FlowActionMenuProps {
  flow: PopulatedFlow;
  onRename: (flow: PopulatedFlow) => void;
  onDuplicate: () => void;
  onShare: (flow: PopulatedFlow) => void;
  onDelete: () => void;
}

const FlowActionMenu: React.FC<FlowActionMenuProps> = ({
  flow,
  onRename,
  onDuplicate,
  onShare,
  onDelete,
}) => {
  const { mutate: duplicateFlow } = useMutation({
    mutationFn: async () => {
      const createdFlow = await flowsApi.create({
        displayName: flow.version.displayName,
        projectId: authenticationSession.getProjectId(),
      });
      const updatedFlow = await flowsApi.update(createdFlow.id, {
        type: FlowOperationType.IMPORT_FLOW,
        request: {
          displayName: flow.version.displayName,
          trigger: flow.version.trigger,
        },
      });
      return updatedFlow;
    },
    onSuccess: (data) => {
      window.open(`/flows/${data.id}`, '_blank', 'rel=noopener noreferrer');
      onDuplicate();
    },
    onError: () => toast(INTERNAL_ERROR_TOAST),
  });

  const exportFlow = async () => {
    const template = await flowsApi.getTemplate(flow.id, {});
    flowsUtils.downloadFlow(template);
  };

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger className="p-2 rounded-full hover:bg-muted">
        <EllipsisVertical className="h-6 w-6" />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => onRename(flow)}>
          <div className="flex flex-row gap-2 items-center">
            <Pencil className="h-4 w-4" />
            <span>Rename</span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => duplicateFlow()}>
          <div className="flex flex-row gap-2 items-center">
            <Copy className="h-4 w-4" />
            <span>Duplicate</span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => exportFlow()}>
          <div className="flex flex-row gap-2 items-center">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onShare(flow)}>
          <div className="flex flex-row gap-2 items-center">
            <Share2 className="h-4 w-4" />
            <span>Share</span>
          </div>
        </DropdownMenuItem>
        <ConfirmationDeleteDialog
          title={`Delete flow ${flow.version.displayName}`}
          message="Are you sure you want to delete this flow? This will permanently delete the flow, all its data and any background runs."
          mutationFn={async () => {
            await flowsApi.delete(flow.id);
            onDelete();
          }}
          entityName={'flow'}
        >
          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
            <div className="flex flex-row gap-2 items-center">
              <Trash2 className="h-4 w-4 text-destructive" />
              <span className="text-destructive">Delete</span>
            </div>
          </DropdownMenuItem>
        </ConfirmationDeleteDialog>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default FlowActionMenu;