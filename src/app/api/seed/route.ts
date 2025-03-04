import { NextResponse } from 'next/server';
import { createTableRow } from '@/utils/db';

export async function POST() {
  try {
    // Örnek kullanıcılar ekle
    const user1 = await createTableRow('yellcord_users', {
      username: 'john_doe',
      email: 'john@example.com',
      password: 'hashed_password_1'
    });

    const user2 = await createTableRow('yellcord_users', {
      username: 'jane_doe',
      email: 'jane@example.com',
      password: 'hashed_password_2'
    });

    // Örnek odalar ekle
    await createTableRow('rooms', {
      name: 'Genel Sohbet',
      description: 'Herkes için genel sohbet odası',
      created_by: user1[0].id
    });

    await createTableRow('rooms', {
      name: 'Teknik Tartışma',
      description: 'Teknik konular hakkında tartışma odası',
      created_by: user2[0].id
    });

    return NextResponse.json({ message: 'Örnek veriler başarıyla eklendi' });
  } catch (error: any) {
    console.error('Veri ekleme hatası:', error);
    return NextResponse.json(
      {
        error: 'Veri ekleme hatası',
        details: error.message,
        stack: error.stack
      },
      { status: 500 }
    );
  }
} 