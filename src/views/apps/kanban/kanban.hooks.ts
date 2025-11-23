import { useState, useEffect, useMemo, useCallback } from 'react';
import { BoardData, Card, Column, MoveCardPayload } from './kanban.types';

const STORAGE_KEY = 'modernize-kanban-board';

const createInitialData = (): BoardData => ({
  columns: [
    {
      id: 'todo',
      title: 'Todo',
      color: '#E5EDFF',
      cardIds: ['card-1', 'card-2'],
    },
    {
      id: 'progress',
      title: 'Progress',
      color: '#E3F6FF',
      cardIds: ['card-3'],
    },
    {
      id: 'pending',
      title: 'Pending',
      color: '#FFF2DE',
      cardIds: ['card-4'],
    },
    {
      id: 'done',
      title: 'Done',
      color: '#E1F8F2',
      cardIds: ['card-5'],
    },
  ],
  cards: {
    'card-1': {
      id: 'card-1',
      title: 'This is first task',
      description: '',
      image: 'https://images.unsplash.com/photo-1520763185298-1b434c919102?auto=format&fit=crop&w=800&q=60',
      dueDate: '2025-07-24',
      labels: ['Design'],
    },
    'card-2': {
      id: 'card-2',
      title: 'Ideate user research',
      description: 'Gather notes from last customer interviews and highlight patterns.',
      dueDate: '2025-07-26',
      labels: ['Research'],
    },
    'card-3': {
      id: 'card-3',
      title: 'Design navigation changes',
      description: 'Update the mobile navigation to match new flows.',
      dueDate: '2025-07-24',
      labels: ['Mobile'],
    },
    'card-4': {
      id: 'card-4',
      title: 'Persona development',
      description: 'Create updated personas for main user segments based on Q2 data.',
      dueDate: '2025-07-24',
      labels: ['UX Stage'],
    },
    'card-5': {
      id: 'card-5',
      title: 'Usability testing report',
      description: 'Summarize findings from July usability tests and share with stakeholders.',
      image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=60',
      dueDate: '2025-07-29',
      labels: ['Testing'],
    },
  },
});

const loadBoard = (initial?: BoardData): BoardData => {
  if (typeof window === 'undefined') {
    return initial ?? createInitialData();
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored) as BoardData;
      if (parsed?.columns && parsed?.cards) {
        return parsed;
      }
    } catch (error) {
      console.warn('Failed to parse stored Kanban board', error);
    }
  }

  return initial ?? createInitialData();
};

const sanitizeIndex = (index: number, length: number): number => {
  if (index < 0) {
    return 0;
  }
  if (index > length) {
    return length;
  }
  return index;
};

export const useKanban = (initial?: BoardData) => {
  const [board, setBoard] = useState<BoardData>(() => loadBoard(initial));

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(board));
  }, [board]);

  const addColumn = useCallback((title: string, color?: string) => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      return;
    }

    setBoard((prev) => {
      const newColumn: Column = {
        id: `column-${Date.now()}`,
        title: trimmedTitle,
        color: color ?? '#EEF2FF',
        cardIds: [],
      };

      return {
        ...prev,
        columns: [...prev.columns, newColumn],
      };
    });
  }, []);

  const removeColumn = useCallback((columnId: string) => {
    setBoard((prev) => {
      const column = prev.columns.find((col) => col.id === columnId);
      if (!column) {
        return prev;
      }

      const remainingCards = { ...prev.cards };
      column.cardIds.forEach((cardId) => {
        delete remainingCards[cardId];
      });

      return {
        columns: prev.columns.filter((col) => col.id !== columnId),
        cards: remainingCards,
      };
    });
  }, []);

  const addCard = useCallback((columnId: string, card: Omit<Card, 'id'>) => {
    const trimmedTitle = card.title.trim();
    if (!trimmedTitle) {
      return;
    }

    const id = `card-${Date.now()}`;
    const newCard: Card = {
      ...card,
      id,
      title: trimmedTitle,
    };

    setBoard((prev) => {
      const updatedColumns = prev.columns.map((column) =>
        column.id === columnId
          ? { ...column, cardIds: [...column.cardIds, id] }
          : column,
      );

      return {
        columns: updatedColumns,
        cards: {
          ...prev.cards,
          [id]: newCard,
        },
      };
    });
  }, []);

  const updateCard = useCallback((cardId: string, updates: Partial<Card>) => {
    setBoard((prev) => {
      if (!prev.cards[cardId]) {
        return prev;
      }

      return {
        ...prev,
        cards: {
          ...prev.cards,
          [cardId]: {
            ...prev.cards[cardId],
            ...updates,
            title: updates.title?.trim() ?? prev.cards[cardId].title,
          },
        },
      };
    });
  }, []);

  const removeCard = useCallback((cardId: string) => {
    setBoard((prev) => {
      if (!prev.cards[cardId]) {
        return prev;
      }

      const updatedColumns = prev.columns.map((column) => ({
        ...column,
        cardIds: column.cardIds.filter((id) => id !== cardId),
      }));

      const updatedCards = { ...prev.cards };
      delete updatedCards[cardId];

      return {
        columns: updatedColumns,
        cards: updatedCards,
      };
    });
  }, []);

  const moveCard = useCallback((payload: MoveCardPayload) => {
    setBoard((prev) => {
      const { cardId, fromColumnId, toColumnId } = payload;
      const fromColumn = prev.columns.find((column) => column.id === fromColumnId);
      const toColumn = prev.columns.find((column) => column.id === toColumnId);
      if (!fromColumn || !toColumn) {
        return prev;
      }

      const sourceIndex = fromColumn.cardIds.indexOf(cardId);
      if (sourceIndex === -1) {
        return prev;
      }

      const fromCardIds = [...fromColumn.cardIds];
      fromCardIds.splice(sourceIndex, 1);

      const destinationCardIds = fromColumnId === toColumnId ? fromCardIds : [...toColumn.cardIds];
      const targetIndex = sanitizeIndex(payload.toIndex, destinationCardIds.length);
      destinationCardIds.splice(targetIndex, 0, cardId);

      return {
        ...prev,
        columns: prev.columns.map((column) => {
          if (column.id === fromColumnId) {
            return { ...column, cardIds: fromCardIds };
          }
          if (column.id === toColumnId) {
            return { ...column, cardIds: destinationCardIds };
          }
          return column;
        }),
      };
    });
  }, []);

  const exportBoard = useCallback((): string => JSON.stringify(board, null, 2), [board]);

  const importBoard = useCallback((payload: string | BoardData) => {
    let data: BoardData | null = null;

    if (typeof payload === 'string') {
      try {
        data = JSON.parse(payload) as BoardData;
      } catch (error) {
        console.error('Failed to parse imported board', error);
        return false;
      }
    } else {
      data = payload;
    }

    if (!data || !Array.isArray(data.columns) || typeof data.cards !== 'object') {
      return false;
    }

    setBoard(data);
    return true;
  }, []);

  const api = useMemo(
    () => ({
      board,
      addColumn,
      removeColumn,
      addCard,
      updateCard,
      removeCard,
      moveCard,
      importBoard,
      exportBoard,
    }),
    [board, addColumn, removeColumn, addCard, updateCard, removeCard, moveCard, importBoard, exportBoard],
  );

  return api;
};
