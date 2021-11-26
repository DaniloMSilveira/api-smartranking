import { Schema } from 'mongoose';

export const DesafioSchema = new Schema(
  {
    dataHoraDesafio: Date,
    status: String,
    dataHoraSolicitacao: Date,
    dataHoraResposta: Date,
    solicitante: {
      type: Schema.Types.ObjectId,
      ref: 'Jogador',
    },
    categoria: String,
    jogadores: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Jogador',
      },
    ],
    partida: {
      type: Schema.Types.ObjectId,
      ref: 'Partida',
    },
  },
  { timestamps: true, collection: 'desafios' },
);
