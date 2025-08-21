# BookMagic - Professional Book Formatting SaaS

A web-based manuscript-to-EPUB/PDF conversion tool that transforms uploaded manuscript files into store-ready digital and print formats using beautifully designed formatting templates.

## 🚀 Features

- **Multiple Format Support**: Upload `.docx`, `.md`, or `.rtf` files
- **Professional Templates**: Choose from curated formatting templates for different book genres
- **EPUB 3 Generation**: Clean, valid EPUBs that pass epubcheck
- **Print-Ready PDFs**: Exact trim size PDFs for print-on-demand services
- **Complete Package**: Download ZIP with files, font licenses, and KDP checklist
- **Real-time Progress**: Watch your conversion progress in real-time
- **PWA Support**: Install as a Progressive Web App

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** (App Router, TypeScript)
- **Tailwind CSS** for styling
- **React Server Components**
- **Heroicons** for icons
- **React Dropzone** for file uploads
- **PWA** support with manifest

### Backend (Mocked for MVP)
- **Mock Authentication** (simulates Supabase Auth)
- **Mock Database** (simulates project/job management)
- **Mock Storage** (simulates file storage)

### Converter (Real Implementation Ready)
- **Node.js** worker in `/converter`
- **Pandoc** for document conversion (ready to integrate)
- **Paged.js + Playwright** for PDF generation (ready to integrate)
- **epubcheck** for EPUB validation (ready to integrate)

## 📦 Project Structure

```
bookmagic/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── auth/login/         # Authentication pages
│   │   ├── dashboard/          # Main dashboard
│   │   │   ├── new/           # New project creation
│   │   │   └── [projectId]/   # Project detail pages
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Landing page
│   ├── components/            # Reusable React components
│   │   ├── UploadForm.tsx     # File upload with drag & drop
│   │   └── TemplateSelector.tsx # Template selection UI
│   └── lib/                   # Utility libraries
│       ├── mock-auth.ts       # Mock authentication service
│       ├── mock-db.ts         # Mock database operations
│       └── templates.ts       # Template definitions
├── converter/                 # Document conversion worker
│   ├── worker.ts             # Main conversion logic
│   └── template-css/         # CSS templates for formatting
├── public/                   # Static assets
│   ├── manifest.json         # PWA manifest
│   └── uploads/             # File upload directory
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- For production: Pandoc, Playwright, epubcheck

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ithiraj56/bookmagic.git
   cd bookmagic
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Demo Accounts

The app includes demo accounts for testing:

- **Pro User**: `demo@bookmagic.com` / `demo123`
- **Free User**: `free@bookmagic.com` / `demo123`

## 📖 Usage

1. **Sign In**: Use one of the demo accounts or create a new account
2. **Create Project**: Click "New Project" and upload your manuscript
3. **Choose Template**: Select a professional formatting template
4. **Watch Progress**: Monitor the real-time conversion progress
5. **Download Files**: Get your EPUB, PDF, and complete package

## 🎨 Templates

### Available Templates

- **Classic Novel** (Free): Traditional novel formatting with elegant typography
- **Modern Fiction** (Pro): Contemporary styling with clean lines
- **Business & Non-Fiction** (Free): Professional layout for business books
- **Academic & Research** (Pro): Scholarly formatting with citation styles
- **Poetry Collection** (Pro): Specialized formatting for poetry
- **Children's Book** (Pro): Large text and playful formatting

### Template Features

Each template includes:
- Professional typography settings
- Proper page margins and sizing
- Chapter and section styling
- Print-ready specifications
- E-reader optimization

## 🔧 Development

### Mock Services

The MVP uses mock services that simulate real backend functionality:

- **Authentication**: Local storage-based session management
- **Database**: In-memory project and job storage
- **File Storage**: Simulated file operations
- **Conversion**: Placeholder conversion with progress simulation

### Real Implementation Notes

To convert to production:

1. **Replace mock auth** with Supabase Auth
2. **Replace mock database** with Supabase Database
3. **Implement real file storage** (Supabase Storage or AWS S3)
4. **Integrate Pandoc** for document parsing
5. **Add Paged.js + Playwright** for PDF generation
6. **Include epubcheck** for EPUB validation
7. **Set up Stripe** for billing
8. **Add Resend** for email notifications

### Converter Integration

The `/converter` directory contains a ready-to-integrate document conversion worker:

```bash
# Install converter dependencies (for production)
cd converter
npm install pandoc playwright epubcheck

# Test conversion
node worker.ts input.docx
```

## 🚀 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Connect to Vercel
3. Deploy automatically

### Docker

```bash
# Build container
docker build -t bookmagic .

# Run container
docker run -p 3000:3000 bookmagic
```

## 📱 PWA Features

BookMagic is a Progressive Web App with:

- **Offline Support**: Core functionality works offline
- **Install Prompt**: Add to home screen on mobile/desktop
- **App-like Experience**: Standalone display mode
- **Responsive Design**: Works on all device sizes

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Vellum** for inspiration on professional book formatting
- **Pandoc** for universal document conversion
- **Paged.js** for CSS print layout
- **Next.js** team for the amazing framework
- **Tailwind CSS** for utility-first styling

## 📞 Support

For support, email support@bookmagic.com or create an issue on GitHub.

---

**Made with ❤️ for authors and publishers worldwide**
