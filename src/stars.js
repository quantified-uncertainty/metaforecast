export function getstars(numstars){
  let stars = "★★☆☆☆"
  switch(numstars) {
    case 0:
      stars ="☆☆☆☆☆"
      break;
    case 1:
      stars ="★☆☆☆☆"
      break;
    case 2:
      stars = "★★☆☆☆"
      break;
    case 3:
      stars = "★★★☆☆"
      break;
    case 4:
      stars = "★★★★☆"
      break;
    case 5:
      stars = "★★★★★"
      break;
    default:
      stars = "★★☆☆☆"
  }
  return(stars) 
}
