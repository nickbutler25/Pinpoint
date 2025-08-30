import { ApiClient } from '@mondaydotcomorg/api';
import { GetColumnValueQueryVariables } from "../generated/graphql";

class MondayService {

    static async getMe(shortLiveToken: string) {
        try {
            const mondayClient = new ApiClient({ token: shortLiveToken });
            const me = await mondayClient.operations.getMeOp();
            return me;
        } catch (err) {
            console.error('Error getting user info:', err);
            throw err;
        }
    }

    static async getColumnValue(token: string, itemId: number | string, columnId: string) {
        try {
            const mondayClient = new ApiClient({ token: token });

            const params: GetColumnValueQueryVariables = { 
                itemId: [itemId.toString()], 
                columnId: [columnId] 
            };
            
            // Note: This assumes you have the getColumnValueQuery defined
            // If not, you'll need to create this GraphQL query
            const query = `
                query GetColumnValue($itemId: [ID!], $columnId: [String!]) {
                    items(ids: $itemId) {
                        column_values(ids: $columnId) {
                            value
                            text
                        }
                    }
                }
            `;
            
            const response = await mondayClient.request(query, params) as any;
            return response?.data?.items?.[0]?.column_values?.[0]?.value;
        } catch (err) {
            console.error('Error getting column value:', err);
            throw err;
        }
    }

    static async changeColumnValue(
        token: string, 
        boardId: number | string, 
        itemId: number | string, 
        columnId: string, 
        value: string
    ) {
        try {
            const mondayClient = new ApiClient({ token: token });
            const changeStatusColumn = await mondayClient.operations.changeColumnValueOp({
                boardId: boardId.toString(),
                itemId: itemId.toString(),
                columnId: columnId,
                value: value,
            });
            return changeStatusColumn;
        } catch (err) {
            console.error('Error changing column value:', err);
            throw err;
        }
    }

    // Method for getting board data with columns and items
    static async getBoardData(token: string, boardId: string) {
        try {
            const mondayClient = new ApiClient({ token: token });
            
            const query = `
                query GetBoardData($boardId: [ID!]) {
                    boards(ids: $boardId) {
                        id
                        name
                        columns {
                            id
                            title
                            type
                        }
                        items_page {
                            items {
                                id
                                name
                                column_values {
                                    id
                                    text
                                    value
                                }
                            }
                        }
                    }
                }
            `;

            const response = await mondayClient.request(query, { boardId: [boardId] }) as any;
            const board = response?.data?.boards?.[0];
            
            if (board) {
                // Flatten the items_page structure for easier use
                board.items = board.items_page?.items || [];
                delete board.items_page;
            }
            
            return board;
        } catch (err) {
            console.error('Error getting board data:', err);
            throw err;
        }
    }

    // Additional helper method for getting boards
    static async getBoards(token: string, boardIds?: string[]) {
        try {
            const mondayClient = new ApiClient({ token: token });
            
            const query = `
                query GetBoards($boardIds: [ID!]) {
                    boards(ids: $boardIds) {
                        id
                        name
                        description
                        state
                        board_kind
                        permissions
                    }
                }
            `;

            const response = await mondayClient.request(query, { 
                boardIds: boardIds || [] 
            }) as any;
            
            return response?.data?.boards || [];
        } catch (err) {
            console.error('Error getting boards:', err);
            throw err;
        }
    }
}

export default MondayService;