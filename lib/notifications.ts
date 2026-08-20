import dbConnect from './mongodb';
import Notification from '@/models/Notification';
import Tour from '@/models/Tour';

export async function createNotification(
  tourId: string,
  userId: string,
  type: string,
  title: string,
  message: string
) {
  try {
    await dbConnect();
    
    await Notification.create({
      tour: tourId,
      user: userId,
      type,
      title,
      message,
      read: false,
    });
  } catch (error) {
    console.error('Create notification error:', error);
  }
}

export async function notifyExpenseAdded(tourId: string, userId: string, expenseTitle: string, amount: number) {
  await createNotification(
    tourId,
    userId,
    'expense_added',
    'New Expense Added',
    `Expense "${expenseTitle}" of ৳${amount} was added`
  );
}

export async function notifyMemberJoined(tourId: string, userId: string, memberName: string) {
  await createNotification(
    tourId,
    userId,
    'member_joined',
    'Member Joined',
    `${memberName} joined the tour`
  );
}

export async function notifyDocumentUploaded(tourId: string, userId: string, docTitle: string) {
  await createNotification(
    tourId,
    userId,
    'document_uploaded',
    'Document Uploaded',
    `Document "${docTitle}" was uploaded`
  );
}