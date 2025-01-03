import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { FlowBuilderPage } from './components/FlowBuilderPage';
import { withBuilder } from '@builder6/react';

const queryClient = new QueryClient();

const FlowBuilder = (props) => (
  <QueryClientProvider client={queryClient}>
    <FlowBuilderPage {...props}/>
  </QueryClientProvider>,
)

withBuilder(FlowBuilder, {
  name: 'AP:FlowBuilder',
  inputs: [
    {
      name: 'flowId',
      type: 'string',
      required: true,
    },
  ],
});

export {
  FlowBuilder,
}