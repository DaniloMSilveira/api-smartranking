import { DesafioStatus } from '../interfaces/desafio-status.enum';
import { IsDate, IsOptional } from 'class-validator';

export class AtualizarDesafioDto {
  @IsOptional()
  @IsDate()
  dataHoraDesafio: Date;

  @IsOptional()
  status: DesafioStatus;
}
