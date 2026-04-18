
import React, { useState } from 'react';
import { Lead, Staff } from '../../types';
import { XIcon } from '../icons/XIcon';

interface CommentModalProps {
    isOpen: boolean;
    onClose: () => void;
    lead: Lead | null;
    onAddComment: (leadId: number, text: string) => void;
    staffList: Staff[];
}

export const CommentModal: React.FC<CommentModalProps> = ({ isOpen, onClose, lead, onAddComment, staffList }) => {
    const [newComment, setNewComment] = useState('');

    if (!isOpen || !lead) return null;

    const handleAddComment = () => {
        if (newComment.trim()) {
            onAddComment(lead.id, newComment.trim());
            setNewComment('');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">Conversation History for {lead.fullName}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"><XIcon /></button>
                </div>
                <div className="p-4 overflow-y-auto flex-grow space-y-4">
                    {lead.comments.length === 0 ? (
                        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">No comments yet.</p>
                    ) : (
                        lead.comments.slice().reverse().map(comment => (
                            <div key={comment.id} className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300 flex items-center justify-center font-bold text-sm flex-shrink-0">
                                    {staffList.find(u => u.id === comment.authorId)?.initials || '??'}
                                </div>
                                <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg flex-grow">
                                    <div className="flex justify-between items-center">
                                        <p className="font-semibold text-sm text-gray-900 dark:text-white">{staffList.find(u => u.id === comment.authorId)?.fullName || 'Unknown'}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(comment.date).toLocaleString()}</p>
                                    </div>
                                    <p className="text-sm text-gray-700 dark:text-gray-200 mt-1">{comment.text}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex items-start gap-3 bg-gray-50 dark:bg-gray-800 rounded-b-lg">
                    <textarea value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="Add a new comment..." rows={2} className="w-full text-sm p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-md focus:ring-blue-500 focus:border-blue-500"></textarea>
                    <button onClick={handleAddComment} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">Save</button>
                </div>
            </div>
        </div>
    );
};
