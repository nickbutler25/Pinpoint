import { Request, Response } from 'express';
import MondayService from '../services/monday-service';

export const getBoardData = async (req: Request, res: Response) => {
    try {
        const { boardId } = req.params;
        
        if (!boardId) {
            return res.status(400).json({ error: 'Board ID is required' });
        }

        // For local development with mock board ID, return mock data
        if (boardId === 'mock-board-123') {
            const mockBoard = {
                id: 'mock-board-123',
                name: 'Sample CRM Board',
                columns: [
                    { id: 'location', title: 'Location', type: 'text' },
                    { id: 'name', title: 'Name', type: 'text' },
                    { id: 'company', title: 'Company', type: 'text' }
                ],
                items: [
                    {
                        id: '1',
                        name: 'John Doe',
                        column_values: [
                            { id: 'location', text: 'New York', value: 'New York' },
                            { id: 'name', text: 'John Doe', value: 'John Doe' },
                            { id: 'company', text: 'ABC Corp', value: 'ABC Corp' }
                        ]
                    },
                    {
                        id: '2',
                        name: 'Jane Smith',
                        column_values: [
                            { id: 'location', text: 'Los Angeles', value: 'Los Angeles' },
                            { id: 'name', text: 'Jane Smith', value: 'Jane Smith' },
                            { id: 'company', text: 'XYZ Inc', value: 'XYZ Inc' }
                        ]
                    },
                    {
                        id: '3',
                        name: 'Bob Johnson',
                        column_values: [
                            { id: 'location', text: 'Chicago', value: 'Chicago' },
                            { id: 'name', text: 'Bob Johnson', value: 'Bob Johnson' },
                            { id: 'company', text: 'Tech Solutions', value: 'Tech Solutions' }
                        ]
                    },
                    {
                        id: '4',
                        name: 'Sarah Wilson',
                        column_values: [
                            { id: 'location', text: 'New York', value: 'New York' },
                            { id: 'name', text: 'Sarah Wilson', value: 'Sarah Wilson' },
                            { id: 'company', text: 'Global Industries', value: 'Global Industries' }
                        ]
                    }
                ]
            };
            return res.json({ board: mockBoard });
        }

        // Get the token from the request (you might need to adjust this based on how you handle auth)
        const token = req.headers.authorization?.replace('Bearer ', '') || process.env.MONDAY_SIGNING_SECRET;
        
        if (!token) {
            return res.status(401).json({ error: 'Authorization token required' });
        }

        // Use your existing Monday service
        const board = await MondayService.getBoardData(token, boardId);
        
        if (!board) {
            return res.status(404).json({ error: 'Board not found' });
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