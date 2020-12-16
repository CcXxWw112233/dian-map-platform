import plotImageServices from "@/services/plotImage"
const getPlotImages = (plotId) => {
  return new Promise((resolve) => {
    plotImageServices.getList(plotId).then(res => {
      if (res && res.code === "0") {
        resolve(res.data)
      }
    })
  })
}
export { getPlotImages }