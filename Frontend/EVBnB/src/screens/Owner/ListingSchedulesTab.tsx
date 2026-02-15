import { useEffect, useState } from 'react';
import { Container, Typography, Box, Card, CardContent, CircularProgress, Alert, Grid, Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControlLabel, Checkbox } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import BreadcrumbNav from '../../components/BreadcrumbNav';

interface Schedule {
    _id: string;
    openingTime: string;
    closingTime: string;
    isAvailable: boolean;
    isBlocked: boolean;
    blockReason?: string;
    minSessionDuration?: number;
    maxSessionDuration?: number;
    createdAt: string;
}

interface ListingSchedulesTabProps {
    listingId: string;
    listing?: any;
    onBack: () => void;
}

export default function ListingSchedulesTab({ listingId, listing, onBack }: ListingSchedulesTabProps) {
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [addForm, setAddForm] = useState<any>({
        listingId,
        ownerId: listing?.ownerId || (listing && listing.owner?._id) || '',
        openingTime: '',
        closingTime: '',
        isAvailable: true,
        isBlocked: false,
        blockReason: '',
        minSessionDuration: 1,
        maxSessionDuration: 12,
    });
    const [addLoading, setAddLoading] = useState(false);
    const [addError, setAddError] = useState<string | null>(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editForm, setEditForm] = useState<any>(null);
    const [editLoading, setEditLoading] = useState(false);
    const [editError, setEditError] = useState<string | null>(null);
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchSchedules = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`http://localhost:5000/api/schedules/listing/${listingId}`);
            if (!res.ok) throw new Error('Failed to fetch schedules');
            const data = await res.json();
            setSchedules(data);
        } catch (err: any) {
            setError(err.message || 'Unknown error');
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => { fetchSchedules(); }, [listingId]);

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <BreadcrumbNav
                items={[
                    { label: 'Dashboard', onClick: onBack },
                    { label: 'Listing Schedules', isActive: true },
                ]}
            />
            {listing && (
                <Box mb={3}>
                    <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{listing.title}</Typography>
                    <Typography color="textSecondary">{listing.description}</Typography>
                    <Typography>Type: {listing.chargerType}</Typography>
                    <Typography>Price: ${listing.pricePerHour}/hr</Typography>
                    <Typography>Location: {listing.location?.address || 'N/A'}</Typography>
                    <Typography>Active: {listing.isActive ? 'Yes' : 'No'}</Typography>
                </Box>
            )}
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 0 }}>
                    Schedules for Listing
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => {
                        setAddForm({
                            listingId,
                            ownerId: listing?.ownerId || (listing && listing.owner?._id) || '',
                            openingTime: '',
                            closingTime: '',
                            isAvailable: true,
                            isBlocked: false,
                            blockReason: '',
                            minSessionDuration: 1,
                            maxSessionDuration: 12,
                        });
                        setAddDialogOpen(true);
                    }}
                >
                    Add Schedule
                </Button>
            </Box>
                        {/* Add Schedule Dialog */}
                        <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="sm" fullWidth>
                            <DialogTitle>Add Schedule</DialogTitle>
                            <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
                                {addError && <Alert severity="error">{addError}</Alert>}
                                <TextField
                                    label="Opening Time (e.g. 08:00)"
                                    value={addForm.openingTime}
                                    onChange={e => setAddForm((f: any) => ({ ...f, openingTime: e.target.value }))}
                                    fullWidth
                                    required
                                />
                                <TextField
                                    label="Closing Time (e.g. 20:00)"
                                    value={addForm.closingTime}
                                    onChange={e => setAddForm((f: any) => ({ ...f, closingTime: e.target.value }))}
                                    fullWidth
                                    required
                                />
                                <TextField
                                    label="Min Session Duration (hours)"
                                    type="number"
                                    value={addForm.minSessionDuration}
                                    onChange={e => setAddForm((f: any) => ({ ...f, minSessionDuration: Number(e.target.value) }))}
                                    fullWidth
                                />
                                <TextField
                                    label="Max Session Duration (hours)"
                                    type="number"
                                    value={addForm.maxSessionDuration}
                                    onChange={e => setAddForm((f: any) => ({ ...f, maxSessionDuration: Number(e.target.value) }))}
                                    fullWidth
                                />
                                <FormControlLabel
                                    control={<Checkbox checked={addForm.isAvailable} onChange={e => setAddForm((f: any) => ({ ...f, isAvailable: e.target.checked }))} />}
                                    label="Available"
                                />
                                <FormControlLabel
                                    control={<Checkbox checked={addForm.isBlocked} onChange={e => setAddForm((f: any) => ({ ...f, isBlocked: e.target.checked }))} />}
                                    label="Blocked"
                                />
                                {addForm.isBlocked && (
                                    <TextField
                                        label="Block Reason"
                                        value={addForm.blockReason}
                                        onChange={e => setAddForm((f: any) => ({ ...f, blockReason: e.target.value }))}
                                        fullWidth
                                    />
                                )}
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={() => setAddDialogOpen(false)}>Cancel</Button>
                                <Button
                                    variant="contained"
                                    disabled={addLoading}
                                    onClick={async () => {
                                        setAddLoading(true);
                                        setAddError(null);
                                        try {
                                            if (!addForm.openingTime || !addForm.closingTime) {
                                                setAddError('Opening and closing time are required.');
                                                setAddLoading(false);
                                                return;
                                            }
                                            const res = await fetch('http://localhost:5000/api/schedules', {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify(addForm),
                                            });
                                            if (!res.ok) {
                                                const errData = await res.json();
                                                throw new Error(errData.error || 'Failed to create schedule');
                                            }
                                            setAddDialogOpen(false);
                                            await fetchSchedules();
                                        } catch (err: any) {
                                            setAddError(err.message || 'Unknown error');
                                        } finally {
                                            setAddLoading(false);
                                        }
                                    }}
                                >
                                    Save
                                </Button>
                            </DialogActions>
                        </Dialog>
            {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                    <CircularProgress />
                </Box>
            )}
            {error && <Alert severity="error">{error}</Alert>}
            {!loading && !error && (
                <Grid container spacing={3}>
                    {schedules.length === 0 ? (
                        <Typography>No schedules found for this listing.</Typography>
                    ) : (
                        schedules.map((schedule) => (
                            <Grid item xs={12} md={6} lg={4} key={schedule._id}>
                                <Card>
                                    <CardContent>
                                        <Box display="flex" justifyContent="space-between" alignItems="center">
                                            <Typography variant="h6">{schedule.openingTime} - {schedule.closingTime}</Typography>
                                            <Box>
                                                <IconButton size="small" onClick={() => {
                                                    setEditForm({ ...schedule });
                                                    setEditDialogOpen(true);
                                                }}>
                                                    <EditIcon />
                                                </IconButton>
                                                <IconButton size="small" color="error" onClick={async () => {
                                                    setLoading(true);
                                                    setError(null);
                                                    try {
                                                        const res = await fetch(`http://localhost:5000/api/schedules/${schedule._id}`, { method: 'DELETE' });
                                                        if (!res.ok) throw new Error('Failed to delete schedule');
                                                        await fetchSchedules();
                                                    } catch (err: any) {
                                                        setError(err.message || 'Unknown error');
                                                    } finally {
                                                        setLoading(false);
                                                    }
                                                }}>
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Box>
                                        </Box>
                                        <Typography>Available: {schedule.isAvailable ? 'Yes' : 'No'}</Typography>
                                        <Typography>Blocked: {schedule.isBlocked ? 'Yes' : 'No'}</Typography>
                                        {schedule.isBlocked && schedule.blockReason && (
                                            <Typography>Block Reason: {schedule.blockReason}</Typography>
                                        )}
                                        <Typography>Min Session: {schedule.minSessionDuration}h</Typography>
                                        <Typography>Max Session: {schedule.maxSessionDuration}h</Typography>
                                        <Typography variant="caption" color="textSecondary">
                                            Created: {new Date(schedule.createdAt).toLocaleString()}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))

                    )}
                </Grid>
            )}
            <Box mt={4}>
                <Button variant="outlined" onClick={onBack}>Back to Dashboard</Button>
            </Box>

            {/* Edit Schedule Dialog */}
            <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Edit Schedule</DialogTitle>
                <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
                    {editError && <Alert severity="error">{editError}</Alert>}
                    {editForm && (
                        <>
                            <TextField
                                label="Opening Time (e.g. 08:00)"
                                value={editForm.openingTime}
                                onChange={e => setEditForm((f: any) => ({ ...f, openingTime: e.target.value }))}
                                fullWidth
                                required
                            />
                            <TextField
                                label="Closing Time (e.g. 20:00)"
                                value={editForm.closingTime}
                                onChange={e => setEditForm((f: any) => ({ ...f, closingTime: e.target.value }))}
                                fullWidth
                                required
                            />
                            <TextField
                                label="Min Session Duration (hours)"
                                type="number"
                                value={editForm.minSessionDuration}
                                onChange={e => setEditForm((f: any) => ({ ...f, minSessionDuration: Number(e.target.value) }))}
                                fullWidth
                            />
                            <TextField
                                label="Max Session Duration (hours)"
                                type="number"
                                value={editForm.maxSessionDuration}
                                onChange={e => setEditForm((f: any) => ({ ...f, maxSessionDuration: Number(e.target.value) }))}
                                fullWidth
                            />
                            <FormControlLabel
                                control={<Checkbox checked={editForm.isAvailable} onChange={e => setEditForm((f: any) => ({ ...f, isAvailable: e.target.checked }))} />}
                                label="Available"
                            />
                            <FormControlLabel
                                control={<Checkbox checked={editForm.isBlocked} onChange={e => setEditForm((f: any) => ({ ...f, isBlocked: e.target.checked }))} />}
                                label="Blocked"
                            />
                            {editForm.isBlocked && (
                                <TextField
                                    label="Block Reason"
                                    value={editForm.blockReason}
                                    onChange={e => setEditForm((f: any) => ({ ...f, blockReason: e.target.value }))}
                                    fullWidth
                                />
                            )}
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
                    <Button
                        variant="contained"
                        disabled={editLoading}
                        onClick={async () => {
                            setEditLoading(true);
                            setEditError(null);
                            try {
                                if (!editForm.openingTime || !editForm.closingTime) {
                                    setEditError('Opening and closing time are required.');
                                    setEditLoading(false);
                                    return;
                                }
                                const res = await fetch(`http://localhost:5000/api/schedules/${editForm._id}`, {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify(editForm),
                                });
                                if (!res.ok) {
                                    const errData = await res.json();
                                    throw new Error(errData.error || 'Failed to update schedule');
                                }
                                setEditDialogOpen(false);
                                await fetchSchedules();
                            } catch (err: any) {
                                setEditError(err.message || 'Unknown error');
                            } finally {
                                setEditLoading(false);
                            }
                        }}
                    >
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}
