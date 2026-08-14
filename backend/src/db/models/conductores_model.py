"""
from sqlalchemy import Column, Integer, String

from src.db.connection import Base

from sqlalchemy import Float

class Conductores(Base):
    __tablename__ = "conductores"

    id = Column(Integer, primary_key=True)
    nombre = Column(String, nullable=False)
    licencia = Column(String, unique=True, nullable=False)
    calificacion_promedio = Column(Float, nullable=False)

"""
from deep_translator import GoogleTranslator
import random


palabras_A1 = ("hola", "chau")
palabras_B1 = ("torre", "pimienta")
palabras_C1 = ("extravagante", "reconocimiento")

def traducir (texto, IDoriginal, IDnuevo):
    return(GoogleTranslator(source=IDoriginal, target=IDnuevo).translate(texto))

class usuario:
    def __init__(self, nombre, id, contraseña):
        self.nombre = nombre
        self.__contraseña__ = contraseña
        self.xp = 0
        self.racha = 0
        self.cursos = []

    def sumar_xp (self, xp):
        self.xp += xp

    def sumar_racha (self):
        self.racha +=1

    def agregar_curso (self,curso):
        self.cursos.append(curso)

class curso:
    def __init__(self, idioma, nivel, nombre):
        self.nombre = nombre
        self.idioma = idioma
        self.nivel = nivel
        self.clases = []

    def agregar_clase (self,clase):
        self.clases.append(clase)

class clase:
    def __init__(self, nombre, xp):
        self.nombre = nombre
        self.xp = xp
        self.preguntas = []

    def agregar_pregunta (self, pregunta):
        self.preguntas.append(pregunta)


class pregunta:
    def __init__(self, idioma, nivel):
        pass

class multiple_choice (pregunta):
    def __init__(self):
        super().__init__()

class unir (pregunta):
    def __init__(self):
        super().__init__()
        self.uniones = []
    
    def crear(self):
        for _ in range (4):
            self.uniones.add()
            

    

class escribir (pregunta):
    def __init__(self):
        super().__init__()



