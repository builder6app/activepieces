import { useMutation } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { t } from 'i18next';
import {
  CheckIcon,
  ChevronDown,
  EllipsisVertical,
  Import,
  Plus,
  Workflow,
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import {
  DataTable,
  PaginationParams,
  RowDataWithActions,
} from '@/components/ui/data-table';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { INTERNAL_ERROR_TOAST, toast } from '@/components/ui/use-toast';
import { FlowStatusToggle } from '@/features/flows/components/flow-status-toggle';
import { ImportFlowDialog } from '@/features/flows/components/import-flow-dialog';
import { SelectFlowTemplateDialog } from '@/features/flows/components/select-flow-template-dialog';
import { flowsApi } from '@/features/flows/lib/flows-api';
import { FolderBadge } from '@/features/folders/component/folder-badge';
import { FolderFilterList } from '@/features/folders/component/folder-filter-list';
import { PieceIconList } from '@/features/pieces/components/piece-icon-list';
import { authenticationSession } from '@/lib/authentication-session';
import { formatUtils } from '@/lib/utils';
import { FlowStatus, PopulatedFlow } from '@activepieces/shared';

import FlowActionMenu from '../../../app/components/flow-actions-menu';

const filters = [
  {
    type: 'input',
    title: t('Flow name'),
    accessorKey: 'name',
    options: [],
    icon: CheckIcon,
  } as const,
  {
    type: 'select',
    title: t('Status'),
    accessorKey: 'status',
    options: Object.values(FlowStatus).map((status) => {
      return {
        label: formatUtils.convertEnumToHumanReadable(status),
        value: status,
      };
    }),
    icon: CheckIcon,
  } as const,
];

const FlowsPage = () => {
  const navigate = useNavigate();
  const [refresh, setRefresh] = useState(0);

  const [searchParams] = useSearchParams();

  async function fetchData(
    params: { name: string; status: FlowStatus[] },
    pagination: PaginationParams,
  ) {
    return flowsApi.list({
      projectId: authenticationSession.getProjectId(),
      cursor: pagination.cursor,
      limit: pagination.limit ?? 10,
      status: params.status,
      name: params.name,
      folderId: searchParams.get('folderId') ?? undefined,
    });
  }

  const { mutate: createFlow, isPending: isCreateFlowPending } = useMutation<
    PopulatedFlow,
    Error,
    void
  >({
    mutationFn: async () => {
      const flow = await flowsApi.create({
        projectId: authenticationSession.getProjectId(),
        displayName: t('Untitled'),
      });
      return flow;
    },
    onSuccess: (flow) => {
      navigate(`/flows/${flow.id}`);
    },
    onError: () => toast(INTERNAL_ERROR_TOAST),
  });

  const columns: ColumnDef<RowDataWithActions<PopulatedFlow>>[] = [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('Name')} />
      ),
      cell: ({ row }) => {
        const status = row.original.version.displayName;
        return <div className="text-left">{status}</div>;
      },
    },
    {
      accessorKey: 'steps',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('Steps')} />
      ),
      cell: ({ row }) => {
        return (
          <PieceIconList
            trigger={row.original.version.trigger}
            maxNumberOfIconsToShow={2}
          />
        );
      },
    },
    {
      accessorKey: 'folderId',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('Folder')} />
      ),
      cell: ({ row }) => {
        const folderId = row.original.folderId;
        return (
          <div className="text-left">
            {folderId ? (
              <FolderBadge folderId={folderId} />
            ) : (
              <span>{t('Uncategorized')}</span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'created',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('Created')} />
      ),
      cell: ({ row }) => {
        const created = row.original.created;
        return (
          <div className="text-left font-medium">
            {formatUtils.formatDate(new Date(created))}
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('Status')} />
      ),
      cell: ({ row }) => {
        return (
          <div
            className="flex items-center space-x-2"
            onClick={(e) => e.stopPropagation()}
          >
            <FlowStatusToggle
              flow={row.original}
              flowVersion={row.original.version}
            ></FlowStatusToggle>
          </div>
        );
      },
    },
    {
      accessorKey: 'actions',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="" />
      ),
      cell: ({ row }) => {
        const flow = row.original;
        return (
          <div onClick={(e) => e.stopPropagation()}>
            <FlowActionMenu
              flow={flow}
              readonly={false}
              flowVersion={flow.version}
              onRename={() => setRefresh(refresh + 1)}
              onMoveTo={() => setRefresh(refresh + 1)}
              onDuplicate={() => setRefresh(refresh + 1)}
              onDelete={() => setRefresh(refresh + 1)}
            >
              <EllipsisVertical className="h-10 w-10" />
            </FlowActionMenu>
          </div>
        );
      },
    },
  ];

  return (
    <div className="flex flex-row gap-4 w-full">
      <div className="flex flex-col w-full">
        <div className="mb-4 flex">
          <h1 className="text-3xl font-bold">{t('Flows')}</h1>
          <div className="ml-auto flex flex-row gap-2">
            <ImportFlowDialog>
              <Button variant="outline">
                <Import className="w-4 h-4 mr-2" />
                {t('Import Flow')}
              </Button>
            </ImportFlowDialog>
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button variant="default" loading={isCreateFlowPending}>
                  <span>{t('New flow')}</span>
                  <ChevronDown className="h-4 w-4 ms-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault();
                    createFlow();
                  }}
                  disabled={isCreateFlowPending}
                >
                  <Plus className="h-4 w-4 me-2" />
                  <span>{t('From scratch')}</span>
                </DropdownMenuItem>
                <SelectFlowTemplateDialog>
                  <DropdownMenuItem
                    onSelect={(e) => e.preventDefault()}
                    disabled={isCreateFlowPending}
                  >
                    <Workflow className="h-4 w-4 me-2" />
                    <span>{t('Use a template')}</span>
                  </DropdownMenuItem>
                </SelectFlowTemplateDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="flex flex-row gap-4">
          <FolderFilterList />
          <div className="w-full">
            <DataTable
              columns={columns}
              fetchData={fetchData}
              filters={filters}
              refresh={refresh}
              onRowClick={(row) => navigate(`/flows/${row.id}`)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export { FlowsPage };