import { NotesProvider } from '@/context/NotesContext';
import { Header } from '@/components/Header/Header';
import { Board } from '@/components/Board/Board';

export default function Home() {
  return (
    <NotesProvider>
      <Header />
      <Board />
    </NotesProvider>
  );
}
