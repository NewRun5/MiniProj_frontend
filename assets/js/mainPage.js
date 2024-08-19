$(document).ready(function() {
    $('#useBtn').click(function() {
      window.location.href = 'index.html';
    });
  });

  $(document).ready(function() {
    $('#startBtn').click(function() {
      $.ajax({
        url: '/get-object',  // 백엔드 API 엔드포인트를 지정
        method: 'GET',
        success: function(response) {
          // 여기서 실제 객체명을 사용할 수 있음
          console.log(response.objectName);
          $('.object_display').text(response.objectName); // 예시로 객체명을 화면에 표시
        },
        error: function(error) {
          console.error('오류 발생:', error);
        }
      });
    });
  });