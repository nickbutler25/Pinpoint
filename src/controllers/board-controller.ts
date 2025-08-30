import { Request, Response } from 'express';
import MondayService from '../services/monday-service';

export const getBoardData = async (req: Request, res: Response): Promise<void> => {
    try {
        const { boardId } = req.params;
        
        if (!boardId) {
            res.status(400).json({ error: 'Board ID is required' });
            return;
        }

        // For local development with mock board ID, return mock data
        if (boardId === 'mock-board-123') {
            const mockBoard = {
                id: 'mock-board-123',
                name: 'Sample CRM Board',
                columns: [
                    { id: 'location', title: 'Location', type: 'text' },
                    { id: 'name', title: 'Name', type: 'text' },
                    { id: 'company', title: 'Company', type: 'text' },
                    { id: 'status', title: 'Status', type: 'status' },
                    { id: 'priority', title: 'Priority', type: 'color' }
                ],
                items: [
                    {
                        id: '1',
                        name: 'John Doe',
                        column_values: [
                            { id: 'location', text: 'New York', value: 'New York' },
                            { id: 'name', text: 'John Doe', value: 'John Doe' },
                            { id: 'company', text: 'ABC Corp', value: 'ABC Corp' },
                            { id: 'status', text: 'Active', value: 'Active' },
                            { id: 'priority', text: 'High', value: 'High' }
                        ]
                    },
                    {
                        id: '2',
                        name: 'Jane Smith',
                        column_values: [
                            { id: 'location', text: 'Los Angeles', value: 'Los Angeles' },
                            { id: 'name', text: 'Jane Smith', value: 'Jane Smith' },
                            { id: 'company', text: 'XYZ Inc', value: 'XYZ Inc' },
                            { id: 'status', text: 'Pending', value: 'Pending' },
                            { id: 'priority', text: 'Medium', value: 'Medium' }
                        ]
                    },
                    {
                        id: '3',
                        name: 'Bob Johnson',
                        column_values: [
                            { id: 'location', text: 'Chicago', value: 'Chicago' },
                            { id: 'name', text: 'Bob Johnson', value: 'Bob Johnson' },
                            { id: 'company', text: 'Tech Solutions', value: 'Tech Solutions' },
                            { id: 'status', text: 'Active', value: 'Active' },
                            { id: 'priority', text: 'Low', value: 'Low' }
                        ]
                    },
                    {
                        id: '4',
                        name: 'Sarah Wilson',
                        column_values: [
                            { id: 'location', text: 'New York', value: 'New York' },
                            { id: 'name', text: 'Sarah Wilson', value: 'Sarah Wilson' },
                            { id: 'company', text: 'Global Industries', value: 'Global Industries' },
                            { id: 'status', text: 'Completed', value: 'Completed' },
                            { id: 'priority', text: 'High', value: 'High' }
                        ]
                    },
                    {
                        id: '5',
                        name: 'Mike Davis',
                        column_values: [
                            { id: 'location', text: 'San Francisco', value: 'San Francisco' },
                            { id: 'name', text: 'Mike Davis', value: 'Mike Davis' },
                            { id: 'company', text: 'Innovation Labs', value: 'Innovation Labs' },
                            { id: 'status', text: 'Active', value: 'Active' },
                            { id: 'priority', text: 'Medium', value: 'Medium' }
                        ]
                    }
                ]
            };
            res.json({ board: mockBoard });
            return;
        }

        // Get the token from the request
        const authHeader = req.headers.authorization;
        const token = authHeader?.replace('Bearer ', '') || process.env.MONDAY_SIGNING_SECRET;
        
        if (!token) {
            res.status(401).json({ error: 'Authorization token required' });
            return;
        }

        // Use Monday service to fetch board data
        const board = await MondayService.getBoardData(token, boardId);
        
        if (!board) {
            res.status(404).json({ error: 'Board not found' });
            return;
        }

        res.json({ board });

    } catch (error) {
        console.error('Error fetching board data:', error);
        res.status(500).json({ 
            error: 'Internal server error', 
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};