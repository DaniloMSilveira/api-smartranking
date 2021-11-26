import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JogadoresService } from 'src/jogadores/jogadores.service';
import { AtualizarCategoriaDto } from './dtos/atualizar-categoria.dto';
import { CriarCategoriaDto } from './dtos/criar-categoria.dto';
import { Categoria } from './interfaces/categoria.interface';

@Injectable()
export class CategoriasService {
  constructor(
    @InjectModel('Categoria') private readonly categoriaModel: Model<Categoria>,
    private readonly jogadoresService: JogadoresService,
  ) {}

  async criarCategoria(
    criarCategoriaDto: CriarCategoriaDto,
  ): Promise<Categoria> {
    const { categoria } = criarCategoriaDto;

    const categoriaEncontrada = await this.categoriaModel.findOne({
      categoria,
    });

    if (categoriaEncontrada) {
      throw new BadRequestException(`Categoria ${categoria} ja cadastrada!`);
    }

    const categoriaCriada = new this.categoriaModel(criarCategoriaDto);
    return await categoriaCriada.save();
  }

  async consultarCategorias(): Promise<Categoria[]> {
    return await this.categoriaModel.find().populate('jogadores');
  }

  async consultarCategoriaPeloId(categoria: string): Promise<Categoria> {
    const categoriaEncontrada = await this.categoriaModel.findOne({
      categoria,
    });

    if (!categoriaEncontrada) {
      throw new NotFoundException(`Categoria ${categoria} não encontrada`);
    }

    return categoriaEncontrada;
  }

  async consultarCategoriaDoJogador(idJogador: any): Promise<Categoria> {
    const jogador = await this.jogadoresService.consultarJogadorPeloId(
      idJogador,
    );

    if (!jogador) {
      throw new BadRequestException(
        `O jogador com id ${idJogador} não foi encontrado`,
      );
    }

    return await this.categoriaModel.findOne().where('jogadores').in(idJogador);
  }

  async atualizarCategoria(
    categoria: string,
    atualizarCategoriaDto: AtualizarCategoriaDto,
  ): Promise<void> {
    const categoriaEncontrada = await this.categoriaModel.findOne({
      categoria,
    });

    if (!categoriaEncontrada) {
      throw new NotFoundException(`Categoria ${categoria} não encontrada`);
    }

    await this.categoriaModel.findOneAndUpdate(
      { categoria },
      { $set: atualizarCategoriaDto },
    );
  }

  async atribuirCategoriaJogador(params: string[]): Promise<void> {
    const categoria = params['categoria'];
    const idJogador = params['idJogador'];

    const categoriaEncontrada = await this.categoriaModel.findOne({
      categoria,
    });

    if (!categoriaEncontrada) {
      throw new NotFoundException(`Categoria ${categoria} não encontrada`);
    }

    const jogadorJaCadastradoCategoria = await this.categoriaModel
      .find({ categoria })
      .where('jogadores')
      .in(idJogador);

    if (jogadorJaCadastradoCategoria.length > 0) {
      throw new BadRequestException(
        `Jogador com id ${idJogador} já cadastrado na Categoria ${categoria}`,
      );
    }

    await this.jogadoresService.consultarJogadorPeloId(idJogador);

    categoriaEncontrada.jogadores.push(idJogador);
    await this.categoriaModel.findOneAndUpdate(
      { categoria },
      { $set: categoriaEncontrada },
    );
  }
}