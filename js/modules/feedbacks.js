/**
 * Модуль для роботи з відео відгуками
 */
export function initFeedbacks(pauseOtherVideos = false) {
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

