export function deleteSelection({ selection, images }) {
  const names = Array.from(selection)
    .map(id => images.find(image => image.__id == id))
    .map(image => image.name);

  //   // Create a reference to the file to delete
  // var desertRef = storageRef.child('images/desert.jpg');

  // // Delete the file
  // desertRef.delete().then(function() {
  //   // File deleted successfully
  // }).catch(function(error) {
  //   // Uh-oh, an error occurred!
  // });
  console.log('delete selection', names);
}
