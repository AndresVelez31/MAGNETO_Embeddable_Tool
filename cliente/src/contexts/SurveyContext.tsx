import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Survey, SurveyResponse } from '@/types/survey';
import { encuestaService } from '@/services/encuestaService';
import { mapEncuestaToSurvey, mapSurveyToEncuestaData } from '@/types/mappers';
import { toast } from 'sonner';

interface SurveyContextType {
  surveys: Survey[];
  responses: SurveyResponse[];
  loading: boolean;
  addSurvey: (survey: Survey) => Promise<void>;
  updateSurvey: (id: string, survey: Partial<Survey>) => Promise<void>;
  deleteSurvey: (id: string) => Promise<void>;
  addResponse: (response: SurveyResponse) => Promise<void>;
  getSurveyById: (id: string) => Survey | undefined;
  getSurveyByType: (type: string) => Promise<Survey | null>;
  refreshSurveys: () => Promise<void>;
}

const SurveyContext = createContext<SurveyContextType | undefined>(undefined);

export function SurveyProvider({ children }: { children: ReactNode }) {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [loading, setLoading] = useState(false);

  // Cargar encuestas al montar el componente
  useEffect(() => {
    refreshSurveys();
  }, []);

  const refreshSurveys = async () => {
    try {
      setLoading(true);
      const encuestas = await encuestaService.obtenerEncuestas();
      console.log('Encuestas recibidas del servidor:', encuestas);
      
      const surveysData = encuestas.map((encuesta, index) => {
        try {
          return mapEncuestaToSurvey(encuesta);
        } catch (mapError) {
          console.error(`Error mapeando encuesta ${index}:`, mapError, encuesta);
          // Continuar con las demás encuestas
          return null;
        }
      }).filter(Boolean) as Survey[];
      
      console.log('Encuestas mapeadas:', surveysData);
      setSurveys(surveysData);
    } catch (error) {
      console.error('Error al cargar encuestas:', error);
      toast.error('Error al cargar las encuestas');
      // No lanzar el error, solo establecer array vacío
      setSurveys([]);
    } finally {
      setLoading(false);
    }
  };

  const addSurvey = async (survey: Survey) => {
    try {
      setLoading(true);
      const encuestaData = mapSurveyToEncuestaData(survey);
      const nuevaEncuesta = await encuestaService.crearEncuesta(encuestaData);
      const newSurvey = mapEncuestaToSurvey(nuevaEncuesta);
      setSurveys(prev => [...prev, newSurvey]);
      toast.success('Encuesta creada exitosamente');
    } catch (error) {
      console.error('Error al crear encuesta:', error);
      toast.error('Error al crear la encuesta');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateSurvey = async (id: string, updatedData: Partial<Survey>) => {
    try {
      setLoading(true);
      const encuestaData = mapSurveyToEncuestaData(updatedData);
      const encuestaActualizada = await encuestaService.actualizarEncuesta(id, encuestaData);
      const updatedSurvey = mapEncuestaToSurvey(encuestaActualizada);
      setSurveys(prev =>
        prev.map(survey => survey.id === id ? updatedSurvey : survey)
      );
      toast.success('Encuesta actualizada exitosamente');
    } catch (error) {
      console.error('Error al actualizar encuesta:', error);
      toast.error('Error al actualizar la encuesta');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteSurvey = async (id: string) => {
    try {
      setLoading(true);
      await encuestaService.eliminarEncuesta(id);
      setSurveys(prev => prev.filter(survey => survey.id !== id));
      toast.success('Encuesta eliminada exitosamente');
    } catch (error) {
      console.error('Error al eliminar encuesta:', error);
      toast.error('Error al eliminar la encuesta');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const addResponse = async (response: SurveyResponse) => {
    try {
      const respuestasItem = Object.entries(response.answers).map(([questionId, answer]) => ({
        idPregunta: questionId,
        respuesta: answer,
      }));
      
      await encuestaService.enviarRespuestas(response.surveyId, respuestasItem);
      setResponses(prev => [...prev, response]);
      toast.success('Respuesta enviada exitosamente');
    } catch (error) {
      console.error('Error al enviar respuesta:', error);
      toast.error('Error al enviar la respuesta');
      throw error;
    }
  };

  const getSurveyById = (id: string): Survey | undefined => {
    return surveys.find(survey => survey.id === id);
  };

  const getSurveyByType = async (type: string): Promise<Survey | null> => {
    try {
      const encuesta = await encuestaService.obtenerEncuestaPorTipo(type);
      return mapEncuestaToSurvey(encuesta);
    } catch (error) {
      console.error('Error al obtener encuesta por tipo:', error);
      return null;
    }
  };

  return (
    <SurveyContext.Provider
      value={{
        surveys,
        responses,
        loading,
        addSurvey,
        updateSurvey,
        deleteSurvey,
        addResponse,
        getSurveyById,
        getSurveyByType,
        refreshSurveys,
      }}
    >
      {children}
    </SurveyContext.Provider>
  );
}

export function useSurvey() {
  const context = useContext(SurveyContext);
  if (context === undefined) {
    throw new Error('useSurvey must be used within a SurveyProvider');
  }
  return context;
}
