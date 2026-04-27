import { NextResponse } from 'next/server';
import { messagingApi } from '@line/bot-sdk';

const { MessagingApiClient } = messagingApi;
const client = new MessagingApiClient({
    channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || '',
});

export async function POST(request: Request) {
    try {
        const { message, answer, userId } = await request.json();

        if (!userId || !message || !answer) {
            return NextResponse.json({ error: 'userId, message and answer are required' }, { status: 400 });
        }

        await client.pushMessage({
            to: userId,
            messages: [
                {
                    type: 'flex',
                    altText: `🤖 LINKS AI ตอบกลับ`,
                    contents: {
                        type: 'bubble',
                        header: {
                            type: 'box',
                            layout: 'vertical',
                            backgroundColor: '#1DB446',
                            paddingAll: 'lg',
                            contents: [
                                {
                                    type: 'text',
                                    text: '🤖 LINKS AI Assistant',
                                    color: '#ffffff',
                                    weight: 'bold',
                                    size: 'md',
                                },
                            ],
                        },
                        body: {
                            type: 'box',
                            layout: 'vertical',
                            spacing: 'md',
                            paddingAll: 'lg',
                            contents: [
                                {
                                    type: 'box',
                                    layout: 'vertical',
                                    backgroundColor: '#f5f5f5',
                                    cornerRadius: '8px', // แก้จาก borderRadius เป็น cornerRadius
                                    paddingAll: 'md',
                                    contents: [
                                        { type: 'text', text: '❓ คำถาม', size: 'xs', color: '#888888', weight: 'bold' },
                                        { type: 'text', text: message, wrap: true, size: 'sm', color: '#333333', margin: 'sm' },
                                    ],
                                },
                                {
                                    type: 'box',
                                    layout: 'vertical',
                                    backgroundColor: '#f0faf4',
                                    cornerRadius: '8px', // แก้จาก borderRadius เป็น cornerRadius
                                    paddingAll: 'md',
                                    contents: [
                                        { type: 'text', text: '💡 คำตอบ', size: 'xs', color: '#1DB446', weight: 'bold' },
                                        { type: 'text', text: answer, wrap: true, size: 'sm', color: '#333333', margin: 'sm' },
                                    ],
                                },
                            ],
                        },
                        footer: {
                            type: 'box',
                            layout: 'vertical',
                            paddingAll: 'md',
                            contents: [
                                { type: 'text', text: 'Powered by LINKS Platform', size: 'xs', color: '#aaaaaa', align: 'center' },
                            ],
                        },
                    },
                },
            ],
        });

        return NextResponse.json({ success: true });

    } catch (error: any) {
        // เพิ่มการจับ Error แบบละเอียดของ LINE API จะได้หาบั๊กง่ายขึ้น
        console.error('Send to LINE Error:', error.originalError?.response?.data || error.message || error);
        return NextResponse.json({ error: 'ไม่สามารถส่งข้อความได้' }, { status: 500 });
    }
}