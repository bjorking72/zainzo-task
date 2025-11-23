import { Box } from '@mui/material';
import PageContainer from 'src/components/container/PageContainer';
import KanbanBoard from './KanbanBoard';

const KanbanPage = () => {
  return (
    <PageContainer title="Kanban" description="Manage work with the Kanban board">
      <Box sx={{ 
        p: { xs: 2, sm: 3 }, 
        height: '100%',
        maxWidth: '100%',
        overflow: 'hidden',
      }}>
        <KanbanBoard />
      </Box>
    </PageContainer>
  );
};

export { KanbanPage };
export default KanbanPage;
