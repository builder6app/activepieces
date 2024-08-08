import { nanoid } from 'nanoid';
import { Socket } from 'socket.io-client';

import { api } from '@/lib/api';
import {
  CreateFlowRequest,
  CreateStepRunRequestBody,
  FlowOperationRequest,
  FlowRun,
  FlowRunStatus,
  FlowTemplate,
  FlowVersion,
  FlowVersionMetadata,
  GetFlowQueryParamsRequest,
  GetFlowTemplateRequestQuery,
  ListFlowVersionRequest,
  ListFlowsRequest,
  PopulatedFlow,
  SeekPage,
  StepRunResponse,
  TestFlowRunRequestBody,
  WebsocketClientEvent,
  WebsocketServerEvent,
} from '@activepieces/shared';

export const flowsApi = {
  applyOperation(flowId: string, operation: FlowOperationRequest) {
    return api.post<PopulatedFlow>(`/v1/flows/${flowId}`, operation);
  },
  list(request: ListFlowsRequest): Promise<SeekPage<PopulatedFlow>> {
    return api.get<SeekPage<PopulatedFlow>>('/v1/flows', request);
  },
  create(request: CreateFlowRequest) {
    return api.post<PopulatedFlow>('/v1/flows', request);
  },
  update(flowId: string, request: FlowOperationRequest) {
    return api.post<PopulatedFlow>(`/v1/flows/${flowId}`, request);
  },
  getTemplate(flowId: string, request: GetFlowTemplateRequestQuery) {
    return api.get<FlowTemplate>(`/v1/flows/${flowId}/template`, {
      params: request,
    });
  },
  testFlow(
    socket: Socket,
    request: TestFlowRunRequestBody,
    onUpdate: (response: FlowRun) => void,
  ) {
    socket.emit(WebsocketServerEvent.TEST_FLOW_RUN, request);
    return new Promise<void>((resolve, reject) => {
      socket.on(WebsocketClientEvent.TEST_FLOW_RUN_PROGRESS, (response) => {
        onUpdate(response);
        if (response.status !== FlowRunStatus.RUNNING) {
          resolve();
        }
      });
      socket.on('error', (error) => {
        reject(error);
      });
    });
  },
  testStep(socket: Socket, request: Omit<CreateStepRunRequestBody, 'id'>) {
    const id = nanoid();
    socket.emit(WebsocketServerEvent.TEST_STEP_RUN, {
      ...request,
      id,
    });
    return new Promise<StepRunResponse>((resolve, reject) => {
      socket.on(WebsocketClientEvent.TEST_STEP_FINISHED, (response) => {
        if (response.id === id) {
          resolve(response);
        }
      });
      socket.on('error', (error) => {
        reject(error);
      });
    });
  },
  get(
    flowId: string,
    request?: GetFlowQueryParamsRequest,
  ): Promise<PopulatedFlow> {
    return api.get<PopulatedFlow>(`/v1/flows/${flowId}`, request);
  },
  listVersions(
    flowId: string,
    request: ListFlowVersionRequest,
  ): Promise<SeekPage<FlowVersionMetadata>> {
    return api.get<SeekPage<FlowVersion>>(
      `/v1/flows/${flowId}/versions`,
      request,
    );
  },
  delete(flowId: string) {
    return api.delete<void>(`/v1/flows/${flowId}`);
  },
  count() {
    return api.get<number>('/v1/flows/count');
  },
};