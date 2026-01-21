# Segundo API para el modelo de triage

# Asegurarse de realizar las siguientes acciones
# 1. Instalar un entorno virtual con el script crear_entorno_virtual.sh. 
# 2. Instalar dependencias con el comando:
#        pip install -r requirements.txt
# 3. Tener el archivo modelo_arbol.pkl en el mismo directorio que este script.

# Para correr el servidor usar:
# venv/bin/uvicorn model_api:app --host 0.0.0.0 --port 8001


from fastapi import FastAPI
import pickle
import pandas as pd

app = FastAPI()

with open("modelo_arbol.pkl", "rb") as f:
    model = pickle.load(f)

@app.post("/predecir")
def predict(data: dict):
    df = pd.DataFrame([data])
    pred = model.predict(df)[0]
    return {"prediccion": pred}
