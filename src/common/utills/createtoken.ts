import { JwtService } from '@nestjs/jwt';
import { env } from 'process';
import { TokenPayload } from '../dto/tokenPayload.dto';

interface Payload {
  id: number;
  customer?: { id: number };
  mover?: { id: number };
}

export default function createToken(
  payload: Payload,
  type: 'access' | 'refresh' = 'access',
) {
  const jwtPayload = {
    id: payload.id,
    customerId: payload.customer?.id,
    moverId: payload.mover?.id,
  };

  const jwtService = new JwtService();
  const expiresIn = type === 'access' ? '1d' : '7d';
  const secret = env.JWT_SECRET ?? 'secret';

  return jwtService.sign(jwtPayload, { expiresIn, secret });
}
