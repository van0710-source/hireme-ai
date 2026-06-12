'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ParseResumePage() {
  const [message, setMessage] = useState('');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setMessage(`Selected file: ${file.name}`);
    }
  };

  return (
    <div style={{ padding: '40px' }}>
      <Link href="/" style={{ color: 'blue', textDecoration: 'underline' }}>
        Back to Home
      </Link>
      <h1>PDF Resume Parser</h1>
      <input type="file" accept=".pdf" onChange={handleFileChange} />
      {message && <p>{message}</p>}
    </div>
  );
}
