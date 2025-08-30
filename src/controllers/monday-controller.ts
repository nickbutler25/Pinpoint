import { Request, Response } from 'express';
import MondayService from '../services/monday-service';

// use this as an action to monday.com trigger
export async function executeAction(req: Request, res: Response): Promise<Response> {
    const { shortLivedToken } = req.session;
    const { payload } = req.body;

    try {
        if (!shortLivedToken) {
            return res.status(401).json({ message: 'Authentication token required' });
        }

        // TODO: Implement this function
        return res.status(200).send({});
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'internal server error' });
    }
}

// use this as an action to monday.com trigger
export async function reverseString(req: Request, res: Response): Promise<Response> {
    const { shortLivedToken } = req.session;
    const { payload } = req.body;
    
    try {
        if (!shortLivedToken) {
            return res.status(401).json({ message: 'Authentication token required' });
        }

        if (!payload || !payload.inputFields) {
            return res.status(400).json({ message: 'Invalid payload structure' });
        }

        const { inputFields } = payload;
        const { boardId, itemId, sourceColumnId, targetColumnId }: {
            boardId: number;
            itemId: number;
            sourceColumnId: string;
            targetColumnId: string;
        } = inputFields;

        // Validate required fields
        if (!boardId || !itemId || !sourceColumnId || !targetColumnId) {
            return res.status(400).json({ 
                message: 'Missing required fields: boardId, itemId, sourceColumnId, targetColumnId' 
            });
        }

        const sourceWord: string | undefined = await MondayService.getColumnValue(
            shortLivedToken, 
            itemId, 
            sourceColumnId
        );

        if (!sourceWord) {
            await MondayService.changeColumnValue(
                shortLivedToken, 
                boardId, 
                itemId, 
                targetColumnId, 
                'No word found'
            );
            return res.status(200).send({});
        }

        const reversedWord: string = sourceWord.split('').reverse().join('');
        await MondayService.changeColumnValue(
            shortLivedToken, 
            boardId, 
            itemId, 
            targetColumnId, 
            reversedWord
        );

        return res.status(200).send({ 
            message: 'String reversed successfully',
            original: sourceWord,
            reversed: reversedWord
        });

    } catch (e) {
        console.error('Error in reverseString:', e);
        return res.status(500).send({ 
            message: 'internal server error',
            error: e instanceof Error ? e.message : 'Unknown error'
        });
    }
}