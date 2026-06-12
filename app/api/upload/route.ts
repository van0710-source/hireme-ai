import { NextResponse } from 'next/server';
import pdfParse from 'pdf-parse-fork';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: '没有上传文件' }, { status: 400 });
    }
    
    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: '只支持 PDF 文件' }, { status: 400 });
    }
    
    const buffer = Buffer.from(await file.arrayBuffer());
    const data = await pdfParse(buffer);
    const text = data.text;
    
    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: 'PDF 中没有提取到文本内容' }, { status: 400 });
    }
    
    return NextResponse.json({ text, pageCount: data.numpages });
  } catch (error: any) {
    console.error('PDF 解析错误:', error);
    return NextResponse.json({ error: error.message || 'PDF 解析失败' }, { status: 500 });
  }
}