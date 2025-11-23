import { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
  Paper,
} from '@mui/material';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { IconDownload, IconPlus, IconUpload } from '@tabler/icons-react';
import { useKanban } from './kanban.hooks';
import { BoardData } from './kanban.types';
import KanbanColumn from './KanbanColumn';

type KanbanBoardProps = {
  initialData?: BoardData;
};

const KanbanBoard = ({ initialData }: KanbanBoardProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const {
    board,
    addColumn,
    removeColumn,
    addCard,
    updateCard,
    removeCard,
    moveCard,
    importBoard,
    exportBoard,
  } = useKanban(initialData);

  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [addColumnOpen, setAddColumnOpen] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [importOpen, setImportOpen] = useState(false);
  const [importValue, setImportValue] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const activeCard = useMemo(() => {
    if (!activeCardId) {
      return undefined;
    }
    return board.cards[activeCardId];
  }, [activeCardId, board.cards]);

  const handleDragStart = (event: DragStartEvent) => {
    const data = event.active.data.current as { type: string; cardId?: string } | undefined;
    if (data?.type === 'card' && data.cardId) {
      setActiveCardId(data.cardId);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCardId(null);

    if (!over) {
      return;
    }

    const activeData = active.data.current as { type: string; columnId: string; cardId: string } | undefined;
    const overData = over.data?.current as { type?: string; columnId?: string } | undefined;

    if (!activeData || activeData.type !== 'card') {
      return;
    }

    const sourceColumnId = activeData.columnId;
    let destinationColumnId = sourceColumnId;
    let destinationIndex = 0;

    if (overData?.type === 'card' && overData.columnId) {
      destinationColumnId = overData.columnId;
      const destinationColumn = board.columns.find((column) => column.id === destinationColumnId);
      const overIndex = destinationColumn?.cardIds.indexOf(over.id as string) ?? -1;
      destinationIndex = overIndex >= 0 ? overIndex : destinationColumn?.cardIds.length ?? 0;
    } else if (overData?.type === 'column' && overData.columnId) {
      destinationColumnId = overData.columnId;
      const destinationColumn = board.columns.find((column) => column.id === destinationColumnId);
      destinationIndex = destinationColumn?.cardIds.length ?? 0;
    } else {
      const fallbackColumn = board.columns.find((column) => column.cardIds.includes(over.id as string) || column.id === over.id);
      if (fallbackColumn) {
        destinationColumnId = fallbackColumn.id;
        destinationIndex = fallbackColumn.cardIds.length;
      }
    }

    const sourceColumn = board.columns.find((column) => column.id === sourceColumnId);
    if (!sourceColumn) {
      return;
    }

    const sourceIndex = sourceColumn.cardIds.indexOf(active.id as string);

    if (sourceIndex === -1) {
      return;
    }

    moveCard({
      cardId: active.id as string,
      fromColumnId: sourceColumnId,
      toColumnId: destinationColumnId,
      toIndex: destinationIndex,
    });
  };

  const handleAddColumn = () => {
    if (!newColumnTitle.trim()) {
      return;
    }
    addColumn(newColumnTitle);
    setNewColumnTitle('');
    setAddColumnOpen(false);
  };

  const handleExport = () => {
    const data = exportBoard();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `kanban-board-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    if (!importValue.trim()) {
      return;
    }
    const success = importBoard(importValue);
    if (success) {
      setImportValue('');
      setImportOpen(false);
    }
  };

  return (
    <Box sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column', 
      gap: 3,
      maxWidth: '100%',
      overflow: 'hidden',
    }}>
      <Stack 
        direction={{ xs: 'column', sm: 'row' }} 
        justifyContent="space-between" 
        alignItems={{ xs: 'stretch', sm: 'center' }}
        spacing={2}
        sx={{
          pb: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
          flexShrink: 0,
        }}
      >
        <Typography 
          variant="h4" 
          fontWeight={700} 
          color="text.primary"
          sx={{ 
            fontSize: { xs: '1.5rem', sm: '2rem' },
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          Improving Work Processes
        </Typography>
        <Stack 
          direction="row" 
          spacing={1} 
          flexWrap={{ xs: 'wrap', sm: 'nowrap' }}
          sx={{ gap: 1 }}
        >
          <Button
            variant="contained"
            startIcon={<IconPlus size={18} />}
            onClick={() => setAddColumnOpen(true)}
            size="medium"
            sx={{ minWidth: 'auto', whiteSpace: 'nowrap' }}
          >
            {isMobile ? 'Add' : 'Add List'}
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<IconUpload size={18} />} 
            onClick={() => setImportOpen(true)}
            size="medium"
            sx={{ minWidth: 'auto', whiteSpace: 'nowrap' }}
          >
            Import
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<IconDownload size={18} />} 
            onClick={handleExport}
            size="medium"
            sx={{ minWidth: 'auto', whiteSpace: 'nowrap' }}
          >
            Export
          </Button>
        </Stack>
      </Stack>

      <Box sx={{ 
        flex: 1, 
        overflow: 'hidden',
        borderRadius: 2,
        bgcolor: theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.02)',
        p: 2,
        minHeight: 0,
        width: '100%',
      }}>
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <Box sx={{
            display: 'flex',
            gap: 2,
            overflowX: 'auto',
            overflowY: 'hidden',
            height: '100%',
            pb: 2,
            maxWidth: '100%',
            '&::-webkit-scrollbar': {
              height: 10,
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
              borderRadius: 5,
              margin: '0 8px',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
              borderRadius: 5,
              '&:hover': {
                backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)',
              },
            },
          }}>
          {board.columns.map((column) => {
            const columnCards = column.cardIds
              .map((id) => board.cards[id])
              .filter((card): card is NonNullable<typeof card> => Boolean(card));

            return (
              <KanbanColumn
                key={column.id}
                column={column}
                cards={columnCards}
                onAddCard={addCard}
                onUpdateCard={updateCard}
                onRemoveCard={removeCard}
                onRemoveColumn={removeColumn}
              />
            );
          })}
          </Box>
          <DragOverlay>
            {activeCard ? (
              <Paper
                sx={{
                  width: 300,
                  p: 2,
                  borderRadius: 2,
                  boxShadow: theme.shadows[8],
                  backgroundColor: theme.palette.background.paper,
                }}
              >
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  {activeCard.title}
                </Typography>
                {activeCard.description && (
                  <Typography variant="body2" color="text.secondary">
                    {activeCard.description}
                  </Typography>
                )}
              </Paper>
            ) : null}
          </DragOverlay>
        </DndContext>
      </Box>

      <Dialog open={addColumnOpen} onClose={() => setAddColumnOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Add Column</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            margin="dense"
            label="Column title"
            value={newColumnTitle}
            onChange={(event) => setNewColumnTitle(event.target.value)}
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddColumnOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddColumn} disabled={!newColumnTitle.trim()}>
            Add
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={importOpen} onClose={() => setImportOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Import Board</DialogTitle>
        <DialogContent>
          <TextField
            multiline
            minRows={10}
            fullWidth
            value={importValue}
            onChange={(event) => setImportValue(event.target.value)}
            placeholder="Paste board JSON here"
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImportOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleImport} disabled={!importValue.trim()}>
            Import
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default KanbanBoard;
