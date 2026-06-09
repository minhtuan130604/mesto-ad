import {
  createCardElement,
  deleteCard as removeCardElement,
  updateLikeInfo,
} from "./components/card.js";

import {
  openModalWindow,
  closeModalWindow,
  setCloseModalWindowEventListeners,
} from "./components/modal.js";

import {
  getUserInfo,
  getCardList,
  setUserInfo,
  setUserAvatar,
  addCard,
  deleteCard,
  changeLikeCardStatus,
} from "./components/api.js";

import {
  enableValidation,
  clearValidation,
} from "./components/validation.js";

// Настройки валидации
const validationConfig = {
  formSelector: ".popup__form",
  inputSelector: ".popup__input",
  submitButtonSelector: ".popup__button",
  inactiveButtonClass: "popup__button_disabled",
  inputErrorClass: "popup__input_type_error",
  errorClass: "popup__input-error_active",
};

// DOM узлы
const placesWrap = document.querySelector(".places__list");

const profileFormModalWindow = document.querySelector(".popup_type_edit");
const profileForm = profileFormModalWindow.querySelector(".popup__form");
const profileTitleInput = profileForm.querySelector(".popup__input_type_name");
const profileDescriptionInput = profileForm.querySelector(
  ".popup__input_type_description"
);

const cardFormModalWindow = document.querySelector(".popup_type_new-card");
const cardForm = cardFormModalWindow.querySelector(".popup__form");
const cardNameInput = cardForm.querySelector(".popup__input_type_card-name");
const cardLinkInput = cardForm.querySelector(".popup__input_type_url");

const imageModalWindow = document.querySelector(".popup_type_image");
const imageElement = imageModalWindow.querySelector(".popup__image");
const imageCaption = imageModalWindow.querySelector(".popup__caption");

const cardInfoModalWindow = document.querySelector(".popup_type_info");
const cardInfoModalTitle = cardInfoModalWindow.querySelector(".popup__title");
const cardInfoModalInfoList = cardInfoModalWindow.querySelector(".popup__info");
const cardInfoModalText = cardInfoModalWindow.querySelector(".popup__text");
const cardInfoModalUsersList = cardInfoModalWindow.querySelector(".popup__list");

const openProfileFormButton = document.querySelector(".profile__edit-button");
const openCardFormButton = document.querySelector(".profile__add-button");

const profileTitle = document.querySelector(".profile__title");
const profileDescription = document.querySelector(".profile__description");
const profileAvatar = document.querySelector(".profile__image");

const avatarFormModalWindow = document.querySelector(".popup_type_edit-avatar");
const avatarForm = avatarFormModalWindow.querySelector(".popup__form");
const avatarInput = avatarForm.querySelector(".popup__input_type_avatar");

let currentUserId = "";

const formatDate = (date) =>
  date.toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const createInfoString = (term, description) => {
  const infoItem = document
    .getElementById("popup-info-definition-template")
    .content.querySelector(".popup__info-item")
    .cloneNode(true);

  infoItem.querySelector(".popup__info-term").textContent = term;
  infoItem.querySelector(".popup__info-description").textContent = description;

  return infoItem;
};

const createUserPreview = (userName) => {
  const userItem = document
    .getElementById("popup-info-user-preview-template")
    .content.querySelector(".popup__list-item")
    .cloneNode(true);

  userItem.textContent = userName;

  return userItem;
};

const renderProfile = (userData) => {
  profileTitle.textContent = userData.name;
  profileDescription.textContent = userData.about;
  profileAvatar.style.backgroundImage = `url(${userData.avatar})`;
  currentUserId = userData._id;
};

const renderCard = (cardData, method = "append") => {
  const cardElement = createCardElement(cardData, currentUserId, {
    onPreviewPicture: handlePreviewPicture,
    onLikeIcon: handleLikeCard,
    onDeleteCard: handleDeleteCard,
    onInfoClick: handleInfoClick,
  });

  placesWrap[method](cardElement);
};

const handlePreviewPicture = ({ name, link }) => {
  imageElement.src = link;
  imageElement.alt = name;
  imageCaption.textContent = name;
  openModalWindow(imageModalWindow);
};

const handleInfoClick = (cardId) => {
  getCardList()
    .then((cards) => {
      const cardData = cards.find((card) => card._id === cardId);

      if (!cardData) {
        return;
      }

      cardInfoModalTitle.textContent = "Информация о карточке";
      cardInfoModalInfoList.textContent = "";
      cardInfoModalUsersList.textContent = "";

      cardInfoModalInfoList.append(
        createInfoString("Описание:", cardData.name),
        createInfoString(
          "Дата создания:",
          formatDate(new Date(cardData.createdAt))
        ),
        createInfoString("Владелец:", cardData.owner.name),
        createInfoString("Количество лайков:", cardData.likes.length)
      );

      cardInfoModalText.textContent = "Лайкнули:";

      if (cardData.likes.length === 0) {
        cardInfoModalUsersList.append(createUserPreview("Пока нет лайков"));
      } else {
        cardData.likes.forEach((user) => {
          cardInfoModalUsersList.append(createUserPreview(user.name));
        });
      }

      openModalWindow(cardInfoModalWindow);
    })
    .catch((err) => {
      console.log(err);
    });
};

const handleLikeCard = (cardId, isLiked, likeButton, likeCount) => {
  changeLikeCardStatus(cardId, isLiked)
    .then((updatedCard) => {
      updateLikeInfo(updatedCard, likeButton, likeCount, currentUserId);
    })
    .catch((err) => {
      console.log(err);
    });
};

const handleDeleteCard = (cardElement, cardId) => {
  deleteCard(cardId)
    .then(() => {
      removeCardElement(cardElement);
    })
    .catch((err) => {
      console.log(err);
    });
};

const setButtonText = (button, text) => {
  button.textContent = text;
};

const handleProfileFormSubmit = (evt) => {
  evt.preventDefault();

  const submitButton = evt.submitter;
  setButtonText(submitButton, "Сохранение...");

  setUserInfo({
    name: profileTitleInput.value,
    about: profileDescriptionInput.value,
  })
    .then((userData) => {
      renderProfile(userData);
      closeModalWindow(profileFormModalWindow);
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      setButtonText(submitButton, "Сохранить");
    });
};

const handleAvatarFormSubmit = (evt) => {
  evt.preventDefault();

  const submitButton = evt.submitter;
  setButtonText(submitButton, "Сохранение...");

  setUserAvatar(avatarInput.value)
    .then((userData) => {
      renderProfile(userData);
      closeModalWindow(avatarFormModalWindow);
      avatarForm.reset();
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      setButtonText(submitButton, "Сохранить");
    });
};

const handleCardFormSubmit = (evt) => {
  evt.preventDefault();

  const submitButton = evt.submitter;
  setButtonText(submitButton, "Создание...");

  addCard({
    name: cardNameInput.value,
    link: cardLinkInput.value,
  })
    .then((cardData) => {
      renderCard(cardData, "prepend");
      closeModalWindow(cardFormModalWindow);
      cardForm.reset();
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      setButtonText(submitButton, "Создать");
    });
};

// EventListeners
profileForm.addEventListener("submit", handleProfileFormSubmit);
cardForm.addEventListener("submit", handleCardFormSubmit);
avatarForm.addEventListener("submit", handleAvatarFormSubmit);

openProfileFormButton.addEventListener("click", () => {
  profileTitleInput.value = profileTitle.textContent;
  profileDescriptionInput.value = profileDescription.textContent;

  clearValidation(profileForm, validationConfig);
  openModalWindow(profileFormModalWindow);
});

profileAvatar.addEventListener("click", () => {
  avatarForm.reset();

  clearValidation(avatarForm, validationConfig);
  openModalWindow(avatarFormModalWindow);
});

openCardFormButton.addEventListener("click", () => {
  cardForm.reset();

  clearValidation(cardForm, validationConfig);
  openModalWindow(cardFormModalWindow);
});

// Загружаем пользователя и карточки с сервера
Promise.all([getUserInfo(), getCardList()])
  .then(([userData, cards]) => {
    renderProfile(userData);

    cards.forEach((cardData) => {
      renderCard(cardData);
    });
  })
  .catch((err) => {
    console.log(err);
  });

// Включаем валидацию
enableValidation(validationConfig);

// Настраиваем обработчики закрытия попапов
const allPopups = document.querySelectorAll(".popup");
allPopups.forEach((popup) => {
  setCloseModalWindowEventListeners(popup);
});
