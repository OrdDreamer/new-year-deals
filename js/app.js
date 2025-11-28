function openMobileMenu() {
  const mobileMenu = document.getElementById("mobile-menu");
  const burgerBtn = document.getElementById("burger-btn");

  if (mobileMenu && burgerBtn) {
    mobileMenu.classList.add("mobile-menu--active");
    burgerBtn.setAttribute("aria-expanded", true);

    document.body.style.overflow = "hidden";
  }
}

function closeMobileMenu() {
  const mobileMenu = document.getElementById("mobile-menu");
  const burgerBtn = document.getElementById("burger-btn");

  if (mobileMenu && burgerBtn) {
    mobileMenu.classList.remove("mobile-menu--active");
    burgerBtn.setAttribute("aria-expanded", false);

    document.body.style.overflow = "";
  }
}

function initFeedbacks(pauseOtherVideos = false) {
  const sectionFeedbacksElement = document.querySelector("#feedbacks");
  const feedbackVideos =
    sectionFeedbacksElement.querySelectorAll(".feedbacks__video");

  const updateWrapperState = (video) => {
    const wrapper = video.closest(".feedbacks__video-wrapper");

    if (!wrapper) {
      return;
    }

    if (video.paused) {
      wrapper.classList.remove("feedbacks__video-wrapper--playing");
    } else {
      wrapper.classList.add("feedbacks__video-wrapper--playing");
    }
  };

  const pauseOtherFeedbackVideos = (currentVideo) => {
    feedbackVideos.forEach((video) => {
      if (video !== currentVideo && !video.paused) {
        video.pause();
      }
    });
  };

  const toggleFeedbackVideo = (video) => {
    if (video.paused) {
      if (pauseOtherVideos) {
        pauseOtherFeedbackVideos(video);
      }
      video.play();
    } else {
      video.pause();
    }
  };

  feedbackVideos.forEach((video) => {
    const wrapper = video.closest(".feedbacks__video-wrapper");
    updateWrapperState(video);

    wrapper.addEventListener("click", function () {
      toggleFeedbackVideo(video);
    });

    video.addEventListener("play", function () {
      updateWrapperState(video);
    });

    video.addEventListener("pause", function () {
      updateWrapperState(video);
    });

    video.addEventListener("ended", function () {
      updateWrapperState(video);
    });

    video.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        toggleFeedbackVideo(video);
      }
    });
  });
}

document.addEventListener("DOMContentLoaded", function () {
  const burgerBtn = document.getElementById("burger-btn");
  const closeBtn = document.getElementById("mobile-menu-close");

  if (burgerBtn) {
    burgerBtn.addEventListener("click", openMobileMenu);
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", closeMobileMenu);
  }

  const menuLinks = document.querySelectorAll(".mobile-menu__nav-link");
  menuLinks.forEach((link) => {
    link.addEventListener("click", closeMobileMenu);
  });

  initFeedbacks(false);
});
