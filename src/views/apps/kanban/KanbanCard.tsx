import { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { IconCalendar, IconDotsVertical, IconTrash } from '@tabler/icons-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from './kanban.types';

const labelPalette = ['#5D87FF', '#00C7D4', '#FA896B', '#FFAE1F', '#49BEFF'];

const getLabelColor = (label: string): string => {
  const normalized = label.trim().toLowerCase();
  let hash = 0;
  for (let i = 0; i < normalized.length; i += 1) {
    hash = normalized.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % labelPalette.length;
  return labelPalette[index];
};

type KanbanCardProps = {
  card: Card;
  columnId: string;
  onUpdate: (cardId: string, updates: Partial<Card>) => void;
  onDelete: (cardId: string) => void;
};

const KanbanCard = ({ card, columnId, onUpdate, onDelete }: KanbanCardProps) => {
  const theme = useTheme();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
    data: {
      type: 'card',
      cardId: card.id,
      columnId,
    },
  });

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState(() => ({
    title: card.title,
    description: card.description ?? '',
    image: card.image ?? '',
    dueDate: card.dueDate ?? '',
    labels: (card.labels ?? []).join(', '),
  }));

  const style = useMemo(
    () => ({
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.6 : 1,
      cursor: isDragging ? 'grabbing' : 'grab',
    }),
    [transform, transition, isDragging],
  );

  const formattedDate = useMemo(() => {
    if (!card.dueDate) {
      return '';
    }
    const date = new Date(card.dueDate);
    if (Number.isNaN(date.getTime())) {
      return card.dueDate;
    }
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }, [card.dueDate]);

  const labels = useMemo(() => card.labels ?? [], [card.labels]);

  return (
    <>
      <Paper
        ref={setNodeRef}
        elevation={isDragging ? 8 : 0}
        style={style}
        {...attributes}
        {...listeners}
        sx={{
          p: 2,
          borderRadius: 2,
          backgroundColor: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: isDragging ? theme.shadows[8] : 'none',
          transition: 'all 0.2s ease',
          '&:hover': {
            boxShadow: theme.shadows[3],
            borderColor: theme.palette.primary.main,
          },
        }}
      >
        {card.image && (
          <Box
            component="img"
            src={card.image}
            alt={card.title}
            sx={{
              width: '100%',
              height: 140,
              borderRadius: 1.5,
              objectFit: 'cover',
              mb: 1.5,
            }}
          />
        )}
        <Stack direction="row" alignItems="flex-start" spacing={1} justifyContent="space-between">
          <Typography variant="subtitle2" fontWeight={600} sx={{ flex: 1, lineHeight: 1.4 }}>
            {card.title}
          </Typography>
          <IconButton
            size="small"
            aria-label="Card actions"
            onClick={(event) => {
              event.stopPropagation();
              setAnchorEl(event.currentTarget);
            }}
            sx={{ mt: -0.5, mr: -0.5 }}
          >
            <IconDotsVertical size={16} />
          </IconButton>
        </Stack>
        {card.description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ 
              mt: 1, 
              mb: 1.5, 
              display: '-webkit-box', 
              WebkitLineClamp: 2, 
              WebkitBoxOrient: 'vertical', 
              overflow: 'hidden',
              fontSize: '0.85rem',
              lineHeight: 1.5,
            }}
          >
            {card.description}
          </Typography>
        )}
        <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1}>
          {formattedDate && (
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <IconCalendar size={14} color={theme.palette.text.secondary} />
              <Typography variant="caption" color="text.secondary" fontSize="0.75rem">
                {formattedDate}
              </Typography>
            </Stack>
          )}
          {labels.length > 0 && (
            <Stack direction="row" spacing={0.5} flexWrap="wrap" justifyContent="flex-end">
              {labels.map((label) => (
                <Chip
                  key={label}
                  size="small"
                  label={label}
                  sx={{
                    backgroundColor: getLabelColor(label),
                    color: theme.palette.common.white,
                    fontWeight: 600,
                    height: 20,
                    fontSize: '0.7rem',
                    '& .MuiChip-label': {
                      px: 1,
                    },
                  }}
                />
              ))}
            </Stack>
          )}
        </Stack>
      </Paper>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem
          onClick={() => {
            setAnchorEl(null);
            setForm({
              title: card.title,
              description: card.description ?? '',
              image: card.image ?? '',
              dueDate: card.dueDate ?? '',
              labels: (card.labels ?? []).join(', '),
            });
            setEditOpen(true);
          }}
        >
          Edit
        </MenuItem>
        <MenuItem
          onClick={() => {
            setAnchorEl(null);
            if (window.confirm('Delete this card?')) {
              onDelete(card.id);
            }
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <IconTrash size={16} />
            <span>Delete</span>
          </Stack>
        </MenuItem>
      </Menu>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Card</DialogTitle>
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
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => {
              onUpdate(card.id, {
                title: form.title,
                description: form.description.trim() ? form.description : undefined,
                image: form.image.trim() ? form.image : undefined,
                dueDate: form.dueDate || undefined,
                labels: form.labels
                  .split(',')
                  .map((label) => label.trim())
                  .filter((label) => label.length > 0),
              });
              setEditOpen(false);
            }}
            disabled={!form.title.trim()}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default KanbanCard;
