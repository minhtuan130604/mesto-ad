export const likeCard = (likeButton, isLiked) => {
  likeButton.classList.toggle("card__like-button_is-active", isLiked);
};

export const deleteCard = (cardElement) => {
  cardElement.remove();
};

const getTemplate = () => {
  return document
    .getElementById("card-template")
    .content.querySelector(".card")
    .cloneNode(true);
};

export const createCardElement = (
  data,
  currentUserId,
  { onPreviewPicture, onLikeIcon, onDeleteCard, onInfoClick }
) => {
  const cardElement = getTemplate();
  const likeButton = cardElement.querySelector(".card__like-button");
  const deleteButton = cardElement.querySelector(
    ".card__control-button_type_delete"
  );
  const infoButton = cardElement.querySelector(
    ".card__control-button_type_info"
  );
  const cardImage = cardElement.querySelector(".card__image");
  const likeCount = cardElement.querySelector(".card__like-count");

  cardImage.src = data.link;
  cardImage.alt = data.name;
  cardElement.querySelector(".card__title").textContent = data.name;

  if (likeCount) {
    likeCount.textContent = data.likes.length;
  }

  const isLiked = data.likes.some((user) => user._id === currentUserId);
  likeCard(likeButton, isLiked);

  if (data.owner._id !== currentUserId) {
    deleteButton.remove();
  } else {
    deleteButton.addEventListener("click", () =>
      onDeleteCard(cardElement, data._id)
    );
  }

  likeButton.addEventListener("click", () => {
    const isLikedNow = likeButton.classList.contains(
      "card__like-button_is-active"
    );

    onLikeIcon(data._id, isLikedNow, likeButton, likeCount);
  });

  cardImage.addEventListener("click", () =>
    onPreviewPicture({ name: data.name, link: data.link })
  );

  if (infoButton) {
    infoButton.addEventListener("click", () => {
      onInfoClick(data._id);
    });
  }

  return cardElement;
};

export const updateLikeInfo = (
  cardData,
  likeButton,
  likeCount,
  currentUserId
) => {
  const isLiked = cardData.likes.some((user) => user._id === currentUserId);

  likeCard(likeButton, isLiked);

  if (likeCount) {
    likeCount.textContent = cardData.likes.length;
  }
};
