import { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { IconDotsVertical, IconPlus, IconTrash } from '@tabler/icons-react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Card, Column } from './kanban.types';
import KanbanCard from './KanbanCard';

type KanbanColumnProps = {
  column: Column;
  cards: Card[];
  onAddCard: (columnId: string, card: Omit<Card, 'id'>) => void;
  onUpdateCard: (cardId: string, updates: Partial<Card>) => void;
  onRemoveCard: (cardId: string) => void;
  onRemoveColumn: (columnId: string) => void;
};

const KanbanColumn = ({ column, cards, onAddCard, onUpdateCard, onRemoveCard, onRemoveColumn }: KanbanColumnProps) => {
  const theme = useTheme();
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: { type: 'column', columnId: column.id },
  });

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    image: '',
    dueDate: '',
    labels: '',
  });

  const borderColor = theme.palette.divider;

  const handleSubmit = () => {
    if (!form.title.trim()) {
      return;
    }

    onAddCard(column.id, {
      title: form.title,
      description: form.description.trim() ? form.description : undefined,
      image: form.image.trim() ? form.image : undefined,
      dueDate: form.dueDate || undefined,
      labels: form.labels
        .split(',')
        .map((label) => label.trim())
        .filter((label) => label.length > 0),
    });

    setForm({ title: '', description: '', image: '', dueDate: '', labels: '' });
    setAddOpen(false);
  };

  const columnCards = useMemo(() => cards, [cards]);

  return (
    <Box
      sx={{
        minWidth: { xs: 280, sm: 320 },
        width: { xs: 280, sm: 320 },
        backgroundColor: theme.palette.background.paper,
        borderRadius: 2,
        p: 2,
        border: `1px solid ${borderColor}`,
        transition: 'all 0.2s ease',
        boxShadow: isOver ? theme.shadows[4] : theme.shadows[2],
        flexShrink: 0,
        height: 'fit-content',
        maxHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="subtitle1" fontWeight={700} color="text.primary">
          {column.title}
        </Typography>
        <Stack direction="row" spacing={0.5}>
          <IconButton
            size="small"
            color="primary"
            aria-label="Add card"
            onClick={() => setAddOpen(true)}
            sx={{ 
              '&:hover': { 
                backgroundColor: theme.palette.primary.main + '20' 
              } 
            }}
          >
            <IconPlus size={20} />
          </IconButton>
          <IconButton
            size="small"
            aria-label="Column actions"
            onClick={(event) => setAnchorEl(event.currentTarget)}
          >
            <IconDotsVertical size={20} />
          </IconButton>
        </Stack>
      </Stack>

      <SortableContext items={columnCards.map((card) => card.id)} strategy={verticalListSortingStrategy}>
        <Box
          ref={setNodeRef}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
            minHeight: 100,
            flex: 1,
            overflowY: 'auto',
            pr: 0.5,
            '&::-webkit-scrollbar': {
              width: 6,
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
              borderRadius: 3,
            },
          }}
        >
          {columnCards.map((card) => (
            <KanbanCard
              key={card.id}
              card={card}
              columnId={column.id}
              onUpdate={onUpdateCard}
              onDelete={onRemoveCard}
            />
          ))}
        </Box>
      </SortableContext>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        <MenuItem
          onClick={() => {
            setAnchorEl(null);
            if (window.confirm(`Delete column "${column.title}" and its cards?`)) {
              onRemoveColumn(column.id);
            }
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <IconTrash size={16} />
            <span>Delete Column</span>
          </Stack>
        </MenuItem>
      </Menu>

      <Dialog open={addOpen} onClose={() => setAddOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Card</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Title"
              value={form.title}
              onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
              required
              autoFocus
            />
            <TextField
              label="Description"
              multiline
              minRows={3}
              value={form.description}
              onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
            />
            <TextField
              label="Image URL"
              value={form.image}
              onChange={(event) => setForm((prev) => ({ ...prev, image: event.target.value }))}
            />
            <TextField
              label="Due Date"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={form.dueDate}
              onChange={(event) => setForm((prev) => ({ ...prev, dueDate: event.target.value }))}
            />
            <TextField
              label="Labels (comma separated)"
              value={form.labels}
              onChange={(event) => setForm((prev) => ({ ...prev, labels: event.target.value }))}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={!form.title.trim()}>
            Add Card
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default KanbanColumn;
