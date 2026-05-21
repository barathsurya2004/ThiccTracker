import { Dumbbell, Wave, Bodyweight, Rest } from './Icons';

interface Props {
  modality: string;
  size?: number;
}

export default function ModalityIcon({ modality, size = 18 }: Props) {
  const p = { width: size, height: size };
  if (modality === 'pool') return <Wave {...p} />;
  if (modality === 'calisthenics') return <Bodyweight {...p} />;
  if (modality === 'rest') return <Rest {...p} />;
  return <Dumbbell {...p} />;
}
