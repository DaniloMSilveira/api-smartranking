import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CategoriasService } from 'src/categorias/categorias.service';
import { JogadoresService } from 'src/jogadores/jogadores.service';
import { CriarDesafioDto } from './dtos/criar-desafio.dto';
import { AtualizarDesafioDto } from './dtos/atualizar-desafio.dto';
import { AtribuirDesafioPartidaDto } from './dtos/atribuir-desafio-partida.dto';
import { DesafioStatus } from './interfaces/desafio-status.enum';
import { Desafio, Partida } from './interfaces/desafio.interface';

@Injectable()
export class DesafiosService {
  constructor(
    @InjectModel('Desafio') private readonly desafioModel: Model<Desafio>,
    @InjectModel('Partida') private readonly partidaModel: Model<Partida>,
    private readonly jogadoresService: JogadoresService,
    private readonly categoriasService: CategoriasService,
  ) {}

  async criarDesafio(criarDesafioDto: CriarDesafioDto): Promise<Desafio | any> {
    const { solicitante, jogadores } = criarDesafioDto;

    const solicitanteEhJogador = await jogadores.find(
      (jogador) => jogador._id === solicitante,
    );

    if (!solicitanteEhJogador) {
      throw new BadRequestException(
        `O solicitante deve ser um jogador da partida!`,
      );
    }

    await Promise.all(
      criarDesafioDto.jogadores.map(async (jogadorDto) => {
        const jogadorEncontrado =
          await this.jogadoresService.consultarJogadorPeloId(jogadorDto._id);

        if (!jogadorEncontrado) {
          throw new BadRequestException(
            `Jogador com id ${jogadorDto._id} não encontrado`,
          );
        }
      }),
    );

    const categoriaDoJogador =
      await this.categoriasService.consultarCategoriaDoJogador(
        criarDesafioDto.solicitante,
      );

    if (!categoriaDoJogador) {
      throw new BadRequestException(
        `O solicitante precisa estar registrado em uma categoria!`,
      );
    }

    const desafioCriado = new this.desafioModel(criarDesafioDto);
    desafioCriado.categoria = categoriaDoJogador.categoria;
    desafioCriado.dataHoraSolicitacao = new Date();
    desafioCriado.status = DesafioStatus.PENDENTE;

    return await desafioCriado.save();
  }

  async consultarTodosDesafios(): Promise<Array<Desafio>> {
    return await this.desafioModel
      .find()
      .populate('solicitante')
      .populate('jogadores')
      .populate('partida');
  }

  async consultarDesafiosDeUmJogador(_id: any): Promise<Array<Desafio>> {
    const jogadores = await this.jogadoresService.consultarTodosJogadores();

    const jogadorFilter = jogadores.filter((jogador) => jogador._id == _id);

    if (jogadorFilter.length == 0) {
      throw new BadRequestException(
        `O jogador com id ${_id} não foi encontrado`,
      );
    }

    return await this.desafioModel
      .find()
      .where('jogadores')
      .in(_id)
      .populate('solicitante')
      .populate('jogadores')
      .populate('partida');
  }

  async atualizarDesafio(
    _id: string,
    atualizarDesafioDto: AtualizarDesafioDto,
  ): Promise<void> {
    const desafioEncontrado = await this.desafioModel.findById(_id);

    if (!desafioEncontrado) {
      throw new NotFoundException(`Desafio ${_id} não cadastrado!`);
    }

    if (atualizarDesafioDto.status) {
      desafioEncontrado.dataHoraResposta = new Date();
    }
    desafioEncontrado.status = atualizarDesafioDto.status;
    desafioEncontrado.dataHoraDesafio = atualizarDesafioDto.dataHoraDesafio;

    await this.desafioModel.findOneAndUpdate(
      { _id },
      { $set: desafioEncontrado },
    );
  }

  async atribuirDesafioPartida(
    _id: string,
    atribuirDesafioPartidaDto: AtribuirDesafioPartidaDto,
  ): Promise<void> {
    const desafioEncontrado = await this.desafioModel.findById(_id);

    if (!desafioEncontrado) {
      throw new BadRequestException(`Desafio ${_id} não cadastrado!`);
    }

    const jogadorFilter = desafioEncontrado.jogadores.filter(
      (jogador) => jogador._id == atribuirDesafioPartidaDto.def,
    );

    if (jogadorFilter.length == 0) {
      throw new BadRequestException(
        `O jogador vencedor não faz parte do desafio!`,
      );
    }

    const partidaCriada = new this.partidaModel(atribuirDesafioPartidaDto);

    partidaCriada.categoria = desafioEncontrado.categoria;
    partidaCriada.jogadores = desafioEncontrado.jogadores;

    const resultado = await partidaCriada.save();

    desafioEncontrado.status = DesafioStatus.REALIZADO;
    desafioEncontrado.partida = resultado._id;

    try {
      await this.desafioModel.findOneAndUpdate(
        { _id },
        { $set: desafioEncontrado },
      );
    } catch (error) {
      await this.partidaModel.deleteOne({ _id: resultado._id });
      throw new InternalServerErrorException();
    }
  }

  async deletarDesafio(_id: string): Promise<void> {
    const desafioEncontrado = await this.desafioModel.findById(_id);

    if (!desafioEncontrado) {
      throw new BadRequestException(`Desafio ${_id} não cadastrado!`);
    }

    desafioEncontrado.status = DesafioStatus.CANCELADO;

    await this.desafioModel.findOneAndUpdate(
      { _id },
      { $set: desafioEncontrado },
    );
  }
}
