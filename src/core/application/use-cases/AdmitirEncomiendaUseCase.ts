import { IEncomiendaRepository } from '../../domain/ports/IEncomiendaRepository';
import { calcularTarifa } from '../../../services/tarifadorService';
import { Encomienda } from '../../domain/entities/Encomienda';
import { Encomienda as EncomiendaModel } from '../../../models/types';

export interface AdmitirEncomiendaInput {
  cliente: string;
  alto: number;
  ancho: number;
  largo: number;
  pesoReal: number;
  distanciaKm: number;
  esFragil: boolean;
  esExpress: boolean;
  valorDeclarado: number;
}

export class AdmitirEncomiendaUseCase {
  constructor(private readonly repository: IEncomiendaRepository) {}

  async execute(input: AdmitirEncomiendaInput): Promise<EncomiendaModel> {
    const tarifacion = calcularTarifa({
      alto: input.alto,
      ancho: input.ancho,
      largo: input.largo,
      pesoReal: input.pesoReal,
      distanciaKm: input.distanciaKm,
      esFragil: input.esFragil,
      esExpress: input.esExpress,
      valorDeclarado: input.valorDeclarado
    });

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const codigoSeguimiento = `LOGI-${Date.now().toString().slice(-6)}-${randomSuffix}`;

    // Validar invariantes de dominio mediante la entidad Encomienda
    const entity = new Encomienda({
      codigoSeguimiento,
      cliente: input.cliente,
      alto: input.alto,
      ancho: input.ancho,
      largo: input.largo,
      pesoReal: input.pesoReal,
      pesoVolumetrico: tarifacion.pesoVolumetrico,
      pesoFacturable: tarifacion.pesoFacturable,
      distanciaKm: input.distanciaKm,
      tipoZona: tarifacion.tipoZona,
      esFragil: input.esFragil,
      esExpress: input.esExpress,
      valorDeclarado: input.valorDeclarado,
      tarifaBase: tarifacion.tarifaBase,
      recargoFragil: tarifacion.recargoFragil,
      recargoExpress: tarifacion.recargoExpress,
      costoTotal: tarifacion.costoTotal,
      estado: 'ADMITIDO'
    });

    const creada = await this.repository.crearEncomienda(entity.toJSON());
    return creada;
  }
}
