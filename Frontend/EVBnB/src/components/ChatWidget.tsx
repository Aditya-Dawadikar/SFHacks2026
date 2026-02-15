import { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  CircularProgress,
  Fab,
  IconButton,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';

type ChatEntry = {
  role: 'user' | 'assistant';
  text?: string;
  action?: string;
  data?: unknown;
  isError?: boolean;
};

const DEFAULT_TENANT_ID = '699188b3520a11c02a03e091';
const CHAT_USER_ID = import.meta.env.VITE_CHAT_USER_ID || DEFAULT_TENANT_ID;
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const toDisplayValue = (value: unknown): string => {
  if (value == null) return '-';
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  if (Array.isArray(value)) return `${value.length} item(s)`;
  return 'Object';
};

const formatTime12h = (value: unknown): string => {
  if (typeof value !== 'string' || !value.trim()) return '-';

  const hhmmMatch = value.match(/^(\d{1,2}):(\d{2})$/);
  if (hhmmMatch) {
    const hour = Number(hhmmMatch[1]);
    const minute = hhmmMatch[2];
    if (Number.isNaN(hour) || hour < 0 || hour > 23) return value;
    const suffix = hour >= 12 ? 'PM' : 'AM';
    const twelveHour = hour % 12 === 0 ? 12 : hour % 12;
    return `${twelveHour}:${minute} ${suffix}`;
  }

  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  }

  return value;
};

const formatDateShort = (value: unknown): string => {
  if (typeof value !== 'string' || !value.trim()) return '-';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
};

const formatLabel = (key: string) => key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase());

function KeyValueList({ data }: { data: Record<string, unknown> }) {
  return (
    <Stack spacing={0.5}>
      {Object.entries(data).map(([key, value]) => (
        <Typography key={key} variant="body2">
          <strong>{formatLabel(key)}:</strong> {toDisplayValue(value)}
        </Typography>
      ))}
    </Stack>
  );
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [entries, setEntries] = useState<ChatEntry[]>([]);

  const canSend = useMemo(() => message.trim().length > 0 && !loading, [message, loading]);

  const sendMessage = async () => {
    if (!canSend) return;

    const userMessage = message.trim();
    setError(null);
    setLoading(true);
    setEntries((prev) => [...prev, { role: 'user', text: userMessage }]);
    setMessage('');

    try {
      const res = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': CHAT_USER_ID
        },
        body: JSON.stringify({ message: userMessage })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'Chat request failed');
      }

      setEntries((prev) => [
        ...prev,
        {
          role: 'assistant',
          action: typeof data?.action === 'string' ? data.action : undefined,
          data: data?.data
        }
      ]);
    } catch (err) {
      const messageText = err instanceof Error ? err.message : 'Unknown error';
      setError(messageText);
      setEntries((prev) => [...prev, { role: 'assistant', text: messageText, isError: true }]);
    } finally {
      setLoading(false);
    }
  };

  const renderAssistantContent = (entry: ChatEntry) => {
    if (entry.isError) {
      return <Alert severity="error">{entry.text}</Alert>;
    }

    const data = entry.data;
    if (!entry.action || !data) {
      return <Typography variant="body2">{entry.text || 'No response data'}</Typography>;
    }

    if (entry.action === 'search_listings' && isRecord(data) && Array.isArray(data.listings)) {
      const listings = data.listings.filter(isRecord);
      return (
        <Stack spacing={1}>
          <Typography variant="body2" fontWeight={600}>Found {listings.length} listing(s)</Typography>
          {listings.slice(0, 4).map((listing, idx) => (
            <Paper key={idx} variant="outlined" sx={{ p: 1 }}>
              <Typography variant="body2" fontWeight={600}>
                {String(listing.title || 'Untitled listing')}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {String(listing?.location && isRecord(listing.location) ? listing.location.city || '' : '')}
              </Typography>
              <Typography variant="body2">
                ${toDisplayValue(listing.pricePerHour)}/hr
              </Typography>
            </Paper>
          ))}
        </Stack>
      );
    }

    if (entry.action === 'get_my_reservations' && isRecord(data) && Array.isArray(data.reservations)) {
      const reservations = data.reservations.filter(isRecord);
      return (
        <Stack spacing={1}>
          <Typography variant="body2" fontWeight={600}>You have {reservations.length} reservation(s)</Typography>
          {reservations.slice(0, 4).map((reservation, idx) => (
            <Paper key={idx} variant="outlined" sx={{ p: 1 }}>
              <Typography variant="body2" sx={{ mb: 0.25 }}>
                <strong>Listing:</strong>{' '}
                {isRecord(reservation.listingId)
                  ? String(reservation.listingId.title || 'Untitled listing')
                  : 'Untitled listing'}
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {String(reservation.status || 'unknown').toUpperCase()}
              </Typography>
              <Typography variant="body2">
                {formatDateShort(reservation.date)} | {formatTime12h(reservation.reservedStartTime)} - {formatTime12h(reservation.reservedEndTime)}
              </Typography>
              <Typography variant="body2">Price: ${toDisplayValue(reservation.price)}</Typography>
            </Paper>
          ))}
        </Stack>
      );
    }

    if ((entry.action === 'cancel_reservation' || entry.action === 'extend_reservation') && isRecord(data)) {
      return (
        <Stack spacing={1}>
          <Typography variant="body2" fontWeight={600}>{String(data.message || 'Request completed')}</Typography>
          {isRecord(data.reservation) && (
            <Paper variant="outlined" sx={{ p: 1 }}>
              <KeyValueList
                data={{
                  reservationId: data.reservation._id,
                  status: data.reservation.status,
                  reservedStartTime: data.reservation.reservedStartTime,
                  reservedEndTime: data.reservation.reservedEndTime,
                  noOfSlots: data.reservation.noOfSlots,
                  price: data.reservation.price
                }}
              />
            </Paper>
          )}
        </Stack>
      );
    }

    if (isRecord(data)) {
      return <KeyValueList data={data} />;
    }

    return <Typography variant="body2">{toDisplayValue(data)}</Typography>;
  };

  return (
    <>
      {!open && (
        <Tooltip title="Open AI Chat">
          <Fab
            color="primary"
            onClick={() => setOpen(true)}
            sx={{ position: 'fixed', right: 24, bottom: 24, zIndex: 1300 }}
          >
            <ChatIcon />
          </Fab>
        </Tooltip>
      )}

      {open && (
        <Paper
          elevation={8}
          sx={{
            position: 'fixed',
            right: 24,
            bottom: 24,
            width: 380,
            height: 540,
            zIndex: 1300,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          <Box
            sx={{
              px: 2,
              py: 1.5,
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Typography variant="subtitle1" fontWeight={700}>
              EVBnB AI Chat
            </Typography>
            <IconButton onClick={() => setOpen(false)} size="small" sx={{ color: 'inherit' }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          <Stack spacing={1} sx={{ p: 1.5, flexGrow: 1, overflowY: 'auto', bgcolor: '#fafafa' }}>
            {entries.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                Ask things like: "show my reservations", "cancel reservation &lt;id&gt;", or "find listings under 20 dollars".
              </Typography>
            )}

            {entries.map((entry, index) => (
              <Box
                key={`${entry.role}-${index}`}
                sx={{
                  alignSelf: entry.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '92%'
                }}
              >
                <Paper
                  sx={{
                    p: 1.25,
                    bgcolor: entry.role === 'user' ? 'primary.main' : '#fff',
                    color: entry.role === 'user' ? 'primary.contrastText' : 'text.primary',
                    border: entry.role === 'assistant' ? '1px solid #ececec' : 'none'
                  }}
                >
                  <Typography variant="caption" sx={{ opacity: 0.75, display: 'block', mb: 0.5 }}>
                    {entry.role === 'user' ? 'You' : 'Assistant'}
                  </Typography>
                  {entry.role === 'user' ? (
                    <Typography variant="body2">{entry.text}</Typography>
                  ) : (
                    renderAssistantContent(entry)
                  )}
                </Paper>
              </Box>
            ))}
          </Stack>

          <Box sx={{ p: 1.5, borderTop: '1px solid #e0e0e0' }}>
            {error && (
              <Alert severity="error" sx={{ mb: 1 }}>
                {error}
              </Alert>
            )}
            <Stack direction="row" spacing={1} alignItems="center">
              <TextField
                fullWidth
                size="small"
                placeholder="Type your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    void sendMessage();
                  }
                }}
              />
              <Tooltip title="Send">
                <span>
                  <IconButton color="primary" onClick={() => void sendMessage()} disabled={!canSend}>
                    {loading ? <CircularProgress size={20} /> : <SendIcon />}
                  </IconButton>
                </span>
              </Tooltip>
            </Stack>
          </Box>
        </Paper>
      )}
    </>
  );
}
