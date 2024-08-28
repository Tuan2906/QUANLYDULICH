import styled from 'styled-components';
import { Card, Nav } from 'react-bootstrap';

export const StyledNavbar = styled(Nav)`
    position: relative;
    margin: 0px auto 0;
    width: 590px;
    height: 50px;
    background: transparent;
    border-radius: 8px;
    font-size: 0;
    box-shadow: 0 5px 7px 0 rgba(0, 0, 0, .1);
    a {
        font-size: 15px;
        text-transform: uppercase;
        color: white;
        text-decoration: none;
        line-height: 36px;
        position: relative;
        z-index: 1;
        display: inline-block;
        text-align: center;
    }

    .animation {
        position: absolute;
        height: 100%;
        top: 0;
        z-index: 0;
        background: #1abc9c;
        border-radius: 8px;
        transition: all .5s ease 0s;
    }

    a:nth-child(1) {
        width: 100px;
    }

    .start-home, a:nth-child(1):hover ~ .animation {
        width: 100px;
        left: 0;
    }

    a:nth-child(2) {
        width: 110px;
    }

    a:nth-child(2):hover ~ .animation {
        width: 110px;
        left: 100px;
    }

    a:nth-child(3) {
        width: 200px;
    }

    a:nth-child(3):hover ~ .animation {
        width: 200px;
        left: 210px;
    }

    a:nth-child(4) {
        width: 160px;
    }

    a:nth-child(4):hover ~ .animation {
        width: 160px;
        left: 410px;
    }

    a:nth-child(5) {
        width: 120px;
    }

    a:nth-child(5):hover ~ .animation {
        width: 120px;
        left: 470px;
    }
`;
export const CustomCardImg = styled(Card.Img)`
  width: 100%;
  height: 200px; /* Bạn có thể thay đổi kích thước tùy ý */
  object-fit: cover;
  border-radius: 8px;
`;