import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CriarJogadorDto } from './dtos/criar-jogador.dto';
import { Jogador } from './interfaces/jogador.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AtualizarJogadorDto } from './dtos/atualizar-jogador.dto';

@Injectable()
export class JogadoresService {
  constructor(
    @InjectModel('Jogador') private readonly jogadorModel: Model<Jogador>,
  ) {}

  async procurarJogadorPeloId(id: string): Promise<Jogador> {
    const jogadorEncontrado = await this.jogadorModel.findOne({ _id: id });

    if (!jogadorEncontrado) {
      throw new NotFoundException(`Jogador com id ${id} não encontrado`);
    }

    return jogadorEncontrado;
  }

  async criarJogador(criaJogadorDto: CriarJogadorDto): Promise<Jogador> {
    const { email } = criaJogadorDto;

    const jogadorEncontrado = await this.jogadorModel.findOne({ email });

    if (jogadorEncontrado) {
      throw new BadRequestException(
        `Jogador com e-mail ${email} já cadastrado`,
      );
    }

    const jogadorCriado = new this.jogadorModel(criaJogadorDto);
    await jogadorCriado.save();
    return jogadorCriado;
  }

  async atualizarJogador(
    id: string,
    atualizaJogadorDto: AtualizarJogadorDto,
  ): Promise<void> {
    await this.procurarJogadorPeloId(id);

    await this.jogadorModel.findOneAndUpdate(
      { _id: id },
      { $set: atualizaJogadorDto },
    );
  }

  async consultarTodosJogadores(): Promise<Jogador[]> {
    return await this.jogadorModel.find();
  }

  async consultarJogadorPeloId(id: string): Promise<Jogador> {
    const jogadorEncontrado = await this.procurarJogadorPeloId(id);

    return jogadorEncontrado;
  }

  async deletarJogador(id: string): Promise<any> {
    await this.procurarJogadorPeloId(id);

    return await this.jogadorModel.deleteOne({ _id: id });
  }
}
