import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AtualizarJogadorDto } from './dtos/atualizar-jogador.dto';
import { CriarJogadorDto } from './dtos/criar-jogador.dto';
import { Jogador } from './interfaces/jogador.interface';
import { JogadoresService } from './jogadores.service';
import { ValidacaoParametrosPipe } from '../common/pipes/validacao-parametros.pipe';

@Controller('api/v1/jogadores')
export class JogadoresController {
  constructor(private readonly jogadoresService: JogadoresService) {}

  @Post()
  @UsePipes(ValidationPipe)
  async criarJogador(
    @Body() criarJogadorDto: CriarJogadorDto,
  ): Promise<Jogador> {
    return await this.jogadoresService.criarJogador(criarJogadorDto);
  }

  @Put('/:id')
  @UsePipes(ValidationPipe)
  async atualizarJogador(
    @Param('id', ValidacaoParametrosPipe) id: string,
    @Body() atualizarJogadorDto: AtualizarJogadorDto,
  ): Promise<void> {
    await this.jogadoresService.atualizarJogador(id, atualizarJogadorDto);
  }

  @Get()
  async consultarJogadores(): Promise<Jogador[]> {
    return await this.jogadoresService.consultarTodosJogadores();
  }

  @Get('/:id')
  async consultarJogadorPeloId(
    @Param('id', ValidacaoParametrosPipe) id: string,
  ): Promise<Jogador> {
    return await this.jogadoresService.consultarJogadorPeloId(id);
  }

  @Delete('/:id')
  async deletarJogador(
    @Param('id', ValidacaoParametrosPipe) id: string,
  ): Promise<void> {
    await this.jogadoresService.deletarJogador(id);
  }
}
