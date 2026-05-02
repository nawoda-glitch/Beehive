export const getPrediction = async () => {
  const res = await fetch("http://127.0.0.1:5000/predict");
  return await res.json();
};